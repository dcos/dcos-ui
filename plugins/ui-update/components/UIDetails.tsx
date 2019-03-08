import * as React from "react";
import { catchError, map, startWith } from "rxjs/operators";
import { combineLatest, of } from "rxjs";
import { componentFromStream } from "@dcos/data-service";

import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import { UIMetadata } from "#SRC/js/data/ui-update/UIMetadata";

import { rollbackUI, updateUI } from "#PLUGINS/ui-update/commands";
import AvailableUpdateRow from "#PLUGINS/ui-update/components/AvailableUpdateRow";
import InstalledVersion from "#PLUGINS/ui-update/components/InstalledVersion";
import InitialScreen from "#PLUGINS/ui-update/components/InitialScreen";
import FallbackScreen from "#PLUGINS/ui-update/components/FallbackScreen";
import { UIAction } from "#PLUGINS/ui-update/types/UIAction";
import {
  getAction$,
  getUiMetadata$,
  getUpdateAvailable$
} from "#PLUGINS/ui-update/streams";
import { FormattedPackageVersion } from "#PLUGINS/ui-update/types/FormattedPackageVersion";

function handleRollbackUI() {
  rollbackUI();
}

function handleUpdateClick(version: string) {
  updateUI(version);
}

const UIDetails = componentFromStream(() => {
  return combineLatest<[UIMetadata, FormattedPackageVersion, UIAction]>([
    getUiMetadata$(),
    getUpdateAvailable$(),
    getAction$()
  ]).pipe(
    map(([uiMetadata, latestUpdateAvailable, uiAction]) => {
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
