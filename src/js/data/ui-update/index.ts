import { Observable, of, throwError } from "rxjs";
import { injectable } from "inversify";
import { map, publishReplay, refCount, retry, switchMap } from "rxjs/operators";
import { RequestResponse } from "@dcos/http-service";
import {
  DataLayerExtensionInterface,
  getExtensionModule
} from "@extension-kid/data-layer";

import { DCOSUIUpdateClient, UIVersionResponse } from "dcos-ui-update-client";
import {
  UIMetadata,
  UIMetadataSchema
} from "#SRC/js/data/ui-update/UIMetadata";
import Config from "#SRC/js/config/Config";
import { parseVersion } from "./utils";

declare global {
  interface Window {
    DCOS_UI_VERSION: string;
  }
}

type PossibleMutationArgs = Partial<UIUpdateArgs>;

interface QueryContext {
  [key: string]: any;
  versionStream?: Observable<RequestResponse<UIVersionResponse>>;
}

export interface UIUpdateArgs {
  newVersion: string;
}

function isUIUpdateArgs(args: PossibleMutationArgs): args is UIUpdateArgs {
  return typeof args.newVersion === "string";
}

export const resolvers = {
  UIMetadata: {
    clientBuild() {
      const clientBuildVersion = parseVersion(window.DCOS_UI_VERSION);
      return of(clientBuildVersion);
    },
    packageVersion(_parent = {}, _args = {}, context: QueryContext) {
      if (!context.versionStream) {
        return throwError(
          "Version observable not available on query context object"
        );
      }
      const version$ = context.versionStream;
      return version$.pipe(
        map(
          ({ response }: RequestResponse<UIVersionResponse>) =>
            response.packageVersion
        )
      );
    },
    packageVersionIsDefault(_parent = {}, _args = {}, context: QueryContext) {
      if (!context.versionStream) {
        return throwError(
          "Version observable not available on query context object"
        );
      }
      const version$ = context.versionStream;
      return version$.pipe(
        map(
          ({ response }: RequestResponse<UIVersionResponse>) => response.default
        )
      );
    },
    serverBuild(_parent = {}, _args = {}, context: QueryContext) {
      if (!context.versionStream) {
        return throwError(
          "Version observable not available on query context object"
        );
      }
      const version$ = context.versionStream;
      return version$.pipe(
        map(({ response }: RequestResponse<UIVersionResponse>) =>
          parseVersion(response.buildVersion)
        )
      );
    }
  },
  Query: {
    ui(_parent = {}, _args = {}, context: QueryContext = {}) {
      context.versionStream = of({}).pipe(
        switchMap(() => DCOSUIUpdateClient.fetchVersion(Config.rootUrl)),
        retry(2),
        publishReplay(1),
        refCount()
      );
      return of({});
    }
  },
  Mutation: {
    updateDCOSUI(_parent = {}, args: PossibleMutationArgs = {}) {
      if (!isUIUpdateArgs(args)) {
        return throwError(
          "updateDCOSUI arguments aren't valid for type UIUpdateArgs"
        );
      }

      return DCOSUIUpdateClient.updateUIVersion(
        args.newVersion,
        Config.rootUrl
      ).pipe(
        map(({ response }: RequestResponse<string>) => `Complete: ${response}`)
      );
    },
    resetDCOSUI() {
      return DCOSUIUpdateClient.resetUIVersion(Config.rootUrl).pipe(
        map(({ response }: RequestResponse<string>) => `Complete: ${response}`)
      );
    }
  }
};

export interface Query {
  ui: UIMetadata | null;
}

export const schema = `
${UIMetadataSchema}

extend type Query {
  ui: UIMetadata!
}
extend type Mutation {
  updateDCOSUI(newVersion: String!): String!
  resetDCOSUI: String!
}
`;
export const UIMetatdataDataLayer = Symbol("UIMetatdataDataLayer");

@injectable()
class UIMetatdataExtension implements DataLayerExtensionInterface {
  id = UIMetatdataDataLayer;

  getResolvers() {
    return resolvers;
  }

  getTypeDefinitions() {
    return schema;
  }
}

export default (_context = {}) => getExtensionModule(UIMetatdataExtension);
