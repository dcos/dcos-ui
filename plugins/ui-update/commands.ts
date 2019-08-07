import gql from "graphql-tag";
import { delay, take } from "rxjs/operators";
import DataLayer, { DataLayerType } from "@extension-kid/data-layer/dataLayer";

import container from "#SRC/js/container";
import { getAction$ } from "./streams";
import { UIActions, UIActionType } from "./types/UIAction";

const dl = container.get<DataLayer>(DataLayerType);

const uiServiceActions$ = getAction$();

function rollbackUI(delayMs: number = 45000) {
  uiServiceActions$.next({
    type: UIActionType.Reset,
    action: UIActions.Started,
    value: {
      message: ""
    }
  });
  dl.query(
    gql`
      mutation {
        resetDCOSUI
      }
    `,
    {}
  )
    .pipe(
      take(1),
      delay(delayMs)
    )
    .subscribe(
      result => {
        uiServiceActions$.next({
          type: UIActionType.Reset,
          action: UIActions.Completed,
          value: {
            message: result.data.resetDCOSUI || ""
          }
        });
      },
      error => {
        uiServiceActions$.next({
          type: UIActionType.Reset,
          action: UIActions.Error,
          value: {
            message: error.message
          }
        });
      }
    );
}

function updateUI(version: string, delayMs: number = 45000) {
  uiServiceActions$.next({
    type: UIActionType.Update,
    action: UIActions.Started,
    value: {
      data: version,
      message: ""
    }
  });
  dl.query(
    gql`
      mutation {
        updateDCOSUI(newVersion: $version)
      }
    `,
    {
      version
    }
  )
    .pipe(
      delay(delayMs),
      take(1)
    )
    .subscribe(
      result => {
        uiServiceActions$.next({
          type: UIActionType.Update,
          action: UIActions.Completed,
          value: {
            message: result.data.updateDCOSUI
          }
        });
      },
      error => {
        uiServiceActions$.next({
          type: UIActionType.Update,
          action: UIActions.Error,
          value: {
            message: error.message ? error.message : error,
            data: version
          }
        });
      }
    );
}

export { rollbackUI, updateUI };
