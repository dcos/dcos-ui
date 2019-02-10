import { of, throwError } from "rxjs";
import { map, retry, switchMap } from "rxjs/operators";
import { makeExecutableSchema } from "graphql-tools";
import { RequestResponse } from "@dcos/http-service";
import { CosmosClient, PackageVersionsResponse } from "cosmos-client";

import { Package, PackageSchema } from "#SRC/js/data/cosmos/Package";
import { PackageVersionSchema } from "#SRC/js/data/cosmos/PackageVersion";

export type GeneralArgs = Partial<PackageQueryArgs>;

export interface PackageQueryArgs {
  name: string;
}

function isPackageQueryArgs(args: GeneralArgs): args is PackageQueryArgs {
  return args.name !== undefined;
}

export const resolvers = {
  Package: {
    versions(parent: { name: string }) {
      if (!parent.name) {
        return throwError("Package name must be available to resolve versions");
      }

      return of({}).pipe(
        switchMap(() => CosmosClient.listPackageVersions(parent.name)),
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
};

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
  resolvers
});
