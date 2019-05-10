import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";

import { Package } from "#SRC/js/data/cosmos/Package";
import { schema as cosmosSchema } from "#SRC/js/data/cosmos";
import {
  DEFAULT_UI_METADATA,
  UIMetadata
} from "#SRC/js/data/ui-update/UIMetadata";
import { default as uiServiceSchema } from "#SRC/js/data/ui-update";

function queryCosmosForUIVersions(): Observable<Package> {
  return graphqlObservable<{ package: Package }>(
    gql`
      query {
        package(name: $packageName) {
          name
          versions
        }
      }
    `,
    cosmosSchema,
    { packageName: "dcos-ui" }
  ).pipe(map(result => result.data.package));
}

function queryUIServiceForMetadata(): Observable<UIMetadata> {
  return graphqlObservable<{ ui: UIMetadata }>(
    gql`
      query {
        ui {
          clientBuild
          packageVersion
          packageVersionIsDefault
          serverBuild
        }
      }
    `,
    uiServiceSchema,
    { packageName: "dcos-ui" }
  ).pipe(
    map(result => result.data.ui),
    catchError(() => of(DEFAULT_UI_METADATA))
  );
}

export { queryCosmosForUIVersions, queryUIServiceForMetadata };
