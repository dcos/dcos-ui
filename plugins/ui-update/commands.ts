import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";
import { delay, take } from "rxjs/operators";

import { default as uiServiceSchema } from "#SRC/js/data/ui-update";

import { getAction$ } from "./streams";
import { UIActions, UIActionType } from "./types/UIAction";

const uiServiceActions$ = getAction$();

function rollbackUI(delayMs: number = 45000) {
  uiServiceActions$.next({
    type: UIActionType.Reset,
    action: UIActions.Started,
    value: {
      message: ""
    }
  });
  graphqlObservable<{ resetDCOSUI: string | null }>(
    gql`
      mutation {
        resetDCOSUI
      }
    `,
    uiServiceSchema,
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
  graphqlObservable<{ updateDCOSUI: string }>(
    gql`
      mutation {
        updateDCOSUI(newVersion: $version)
      }
    `,
    uiServiceSchema,
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
