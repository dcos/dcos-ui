import { of, throwError } from "rxjs";
import { map, retry, switchMap } from "rxjs/operators";
import { makeExecutableSchema } from "graphql-tools";
import { RequestResponse } from "@dcos/http-service";
import { CosmosClient, PackageVersionsResponse } from "cosmos-client";

import Config from "#SRC/js/config/Config";
import { Package, PackageSchema } from "#SRC/js/data/cosmos/Package";
import { PackageVersionSchema } from "#SRC/js/data/cosmos/PackageVersion";

export interface ResolverArgs {
  cosmosClient: CosmosClient;
}

export interface GeneralArgs {
  [key: string]: any;
}

export interface PackageQueryArgs {
  name: string;
}

function isPackageQueryArgs(args: GeneralArgs): args is PackageQueryArgs {
  return (args as PackageQueryArgs).name !== undefined;
}

export const resolvers = ({ cosmosClient }: ResolverArgs) => ({
  Package: {
    versions(parent: { name: string }) {
      if (!parent.name) {
        return throwError("Package name must be available to resolve versions");
      }

      return of({}).pipe(
        switchMap(() => cosmosClient.listPackageVersions(parent.name)),
        retry(2),
        map(({ response }: RequestResponse<PackageVersionsResponse>) =>
          Object.keys(response.results).map(version => ({
            version,
            revision: response.results[version]
          }))
        )
      );
    }
  },
  Query: {
    package(_parent: {}, args: GeneralArgs = {}) {
      if (!isPackageQueryArgs(args)) {
        return throwError(
          "Package resolver arguments aren't valid for type PackageQueryArgs"
        );
      }

      return of({ name: args.name });
    }
  }
});

const baseSchema = `
type Query {
  package(name: String!): Package
}
`;
export const schemas: string[] = [
  PackageVersionSchema,
  PackageSchema,
  baseSchema
];

export interface Query {
  package: Package | null;
}

export default makeExecutableSchema({
  typeDefs: schemas,
  resolvers: resolvers({
    cosmosClient: new CosmosClient(Config.rootUrl)
  })
});
