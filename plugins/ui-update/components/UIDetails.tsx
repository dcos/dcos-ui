import * as React from "react";
import {
  catchError,
  filter,
  map,
  startWith,
  switchMap,
  take
} from "rxjs/operators";
import { BehaviorSubject, combineLatest, merge, of } from "rxjs";
import { componentFromStream } from "@dcos/data-service";

import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import { Package } from "#SRC/js/data/cosmos/Package";
import { UIMetadata } from "#SRC/js/data/ui-update/UIMetadata";

import { rollbackUI, updateUI } from "#PLUGINS/ui-update/commands";
import AvailableUpdateRow from "#PLUGINS/ui-update/components/AvailableUpdateRow";
import InstalledVersion from "#PLUGINS/ui-update/components/InstalledVersion";
import InitialScreen from "#PLUGINS/ui-update/components/InitialScreen";
import FallbackScreen from "#PLUGINS/ui-update/components/FallbackScreen";
import {
  queryCosmosForUIVersions,
  queryUIServiceForMetadata
} from "#PLUGINS/ui-update/queries";
import {
  EMPTY_ACTION,
  UIAction,
  UIActions,
  UIActionType
} from "#PLUGINS/ui-update/types/UIAction";
import { versionUpdateAvailable } from "#PLUGINS/ui-update/utils";

const uiServiceActions$ = new BehaviorSubject<UIAction>(EMPTY_ACTION);

function handleRollbackUI() {
  uiServiceActions$.next({
    type: UIActionType.Reset,
    action: UIActions.Started,
    value: ""
  });
  rollbackUI()
    .pipe(take(1))
    .subscribe(
      result => {
        uiServiceActions$.next({
          type: UIActionType.Reset,
          action: UIActions.Completed,
          value: result.data.resetDCOSUI || ""
        });
      },
      error => {
        uiServiceActions$.next({
          type: UIActionType.Reset,
          action: UIActions.Error,
          value: error.message
        });
      }
    );
}

function handleUpdateClick(version: string) {
  uiServiceActions$.next({
    type: UIActionType.Update,
    action: UIActions.Started,
    value: version
  });
  updateUI(version)
    .pipe(take(1))
    .subscribe(
      result => {
        uiServiceActions$.next({
          type: UIActionType.Update,
          action: UIActions.Completed,
          value: result.data.updateDCOSUI
        });
      },
      error => {
        uiServiceActions$.next({
          type: UIActionType.Update,
          action: UIActions.Error,
          value: error
        });
      }
    );
}

const UIDetails = componentFromStream(() => {
  const cosmosVersions$ = queryCosmosForUIVersions();
  const uiMetadata$ = queryUIServiceForMetadata();
  const uiMetadataOnAction$ = uiServiceActions$.pipe(
    filter(
      uiAction =>
        uiAction.action === UIActions.Completed ||
        uiAction.action === UIActions.Error
    ),
    switchMap(() => queryUIServiceForMetadata())
  );

  return combineLatest<[Package, UIMetadata, UIAction]>([
    cosmosVersions$,
    merge(uiMetadata$, uiMetadataOnAction$),
    uiServiceActions$
  ]).pipe(
    map(([packageInfo, uiMetadata, uiAction]) => {
      if (!packageInfo || !uiMetadata) {
        return <InitialScreen />;
      }
      const latestUpdateAvailable = versionUpdateAvailable(
        packageInfo,
        uiMetadata
      );

      return (
        <ConfigurationMapSection>
          <InstalledVersion
            uiMetaData={uiMetadata}
            uiAction={uiAction}
            onRollbackClick={handleRollbackUI}
          />
          <AvailableUpdateRow
            latestVersion={latestUpdateAvailable}
            uiAction={uiAction}
            onUpdateClick={handleUpdateClick}
          />
        </ConfigurationMapSection>
      );
    }),
    catchError(() => of(<FallbackScreen />)),
    startWith(<InitialScreen />)
  );
});

export { UIDetails as default };
