import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import DataLayer, { DataLayerType } from "@extension-kid/data-layer/dataLayer";
import gql from "graphql-tag";

import container from "#SRC/js/container";
import { Package } from "#SRC/js/data/cosmos/Package";
import {
  DEFAULT_UI_METADATA,
  UIMetadata,
} from "#SRC/js/data/ui-update/UIMetadata";

const dl = container.get<DataLayer>(DataLayerType);

function queryCosmosForUIVersions(): Observable<Package> {
  return dl
    .query(
      gql`
        query {
          package(name: $packageName) {
            name
            versions
          }
        }
      `,
      { packageName: "dcos-ui" }
    )
    .pipe(map((result) => result.data.package));
}

function queryUIServiceForMetadata(): Observable<UIMetadata> {
  return dl
    .query(
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
      { packageName: "dcos-ui" }
    )
    .pipe(
      map((result) => result.data.ui),
      catchError(() => of(DEFAULT_UI_METADATA))
    );
}

export { queryCosmosForUIVersions, queryUIServiceForMetadata };
