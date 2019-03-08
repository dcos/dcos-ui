import { BehaviorSubject, Observable, merge, timer, combineLatest } from "rxjs";
import {
  filter,
  map,
  publishReplay,
  refCount,
  switchMap
} from "rxjs/operators";

import Config from "#SRC/js/config/Config";
import { Package } from "#SRC/js/data/cosmos/Package";
import { UIMetadata } from "#SRC/js/data/ui-update/UIMetadata";

import { queryCosmosForUIVersions, queryUIServiceForMetadata } from "./queries";
import { EMPTY_ACTION, UIAction, UIActions } from "./types/UIAction";
import { versionUpdateAvailable } from "./utils";

const action$ = new BehaviorSubject<UIAction>(EMPTY_ACTION);
const pollingTimer$ = timer(0, Config.getLongPollingInterval());
let uiMetadata$: Observable<UIMetadata> | null = null;

function getAction$(): BehaviorSubject<UIAction> {
  return action$;
}

function getUiMetadata$(): Observable<UIMetadata> {
  if (uiMetadata$ !== null) {
    return uiMetadata$;
  }

  const actionsCompleteError$ = action$.pipe(
    filter(
      uiAction =>
        uiAction.action === UIActions.Completed ||
        uiAction.action === UIActions.Error
    )
  );

  const metadata$ = merge(pollingTimer$, actionsCompleteError$).pipe(
    switchMap(() => queryUIServiceForMetadata()),
    publishReplay(1),
    refCount()
  );
  uiMetadata$ = metadata$;

  return metadata$;
}

function getUpdateAvailable$() {
  const uiMetaData$ = getUiMetadata$();
  const cosmosVersions$ = queryCosmosForUIVersions();
  return combineLatest<[UIMetadata, Package]>([
    uiMetaData$,
    cosmosVersions$
  ]).pipe(
    map(([uiMetaData, packageInfo]) =>
      versionUpdateAvailable(packageInfo, uiMetaData)
    )
  );
}

export { getAction$, getUiMetadata$, getUpdateAvailable$ };
