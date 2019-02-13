import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";
import { default as uiServiceSchema } from "#SRC/js/data/ui-update";
import { delay } from "rxjs/operators";

function rollbackUI(delayMs: number = 45000) {
  return graphqlObservable<{ resetDCOSUI: string | null }>(
    gql`
      mutation {
        resetDCOSUI
      }
    `,
    uiServiceSchema,
    {}
  ).pipe(delay(delayMs));
}

function updateUI(version: string, delayMs: number = 45000) {
  return graphqlObservable<{ updateDCOSUI: string }>(
    gql`
      mutation {
        updateDCOSUI(newVersion: $version)
      }
    `,
    uiServiceSchema,
    {
      version
    }
  ).pipe(delay(delayMs));
}

export { rollbackUI, updateUI };
