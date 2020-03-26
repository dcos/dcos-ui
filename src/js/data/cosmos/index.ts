import { of, throwError } from "rxjs";
import { map, retry, switchMap } from "rxjs/operators";
import { CosmosClient } from "./CosmosClient";

import Config from "#SRC/js/config/Config";
import { PackageSchema } from "#SRC/js/data/cosmos/Package";
import { PackageVersionSchema } from "#SRC/js/data/cosmos/PackageVersion";
import { injectable } from "inversify";
import {
  DataLayerExtensionInterface,
  getExtensionModule,
} from "@extension-kid/data-layer";

const client = CosmosClient(Config.rootUrl);
type PossibleQueryArgs = Partial<PackageQueryArgs>;

export interface PackageQueryArgs {
  name: string;
}

function isPackageQueryArgs(args: PossibleQueryArgs): args is PackageQueryArgs {
  return typeof args.name === "string";
}

export const resolvers = {
  Package: {
    versions(parent: { name: string }) {
      if (typeof parent.name !== "string" || parent.name.length === 0) {
        return throwError("Package name must be available to resolve versions");
      }

      return of({}).pipe(
        switchMap(() => client.listPackageVersions(parent.name)),
        retry(2),
        map(({ response }) =>
          Object.entries(response.results).map(([version, revision]) => ({
            version,
            revision,
          }))
        )
      );
    },
  },
  Query: {
    package(_parent: {}, args: PossibleQueryArgs = {}) {
      if (!isPackageQueryArgs(args)) {
        return throwError(
          "Package resolver arguments aren't valid for type PackageQueryArgs"
        );
      }

      return of({ name: args.name });
    },
  },
};

export const schema = `
${PackageVersionSchema}
${PackageSchema}

extend type Query {
  package(name: String!): Package
}
`;

export const CosmosDataLayer = Symbol("CosmosDataLayer");

@injectable()
class CosmosExtension implements DataLayerExtensionInterface {
  public id = CosmosDataLayer;

  public getResolvers() {
    return resolvers;
  }

  public getTypeDefinitions() {
    return schema;
  }
}

export default (_context = {}) => getExtensionModule(CosmosExtension);
