import { Observable, of, throwError, timer } from "rxjs";
import { RequestResponse } from "@dcos/http-service";
import { makeExecutableSchema } from "graphql-tools";

import {
  fetchPackageVersions,
  PackageVersionsResponse
} from "#SRC/js/data/CosmosClient";
import Config from "#SRC/js/config/Config";
import { filter, map, retry, switchMap } from "rxjs/operators";
import { Package, PackageSchema } from "#SRC/js/types/Package";
import { PackageVersionSchema } from "#SRC/js/types/PackageVersion";

export interface ResolverArgs {
  fetchPackageVersions: (
    packageName: string
  ) => Observable<RequestResponse<PackageVersionsResponse>>;
  pollingInterval: number;
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

export const resolvers = ({
  fetchPackageVersions,
  pollingInterval
}: ResolverArgs) => ({
  Package: {
    versions(parent: { name: string }, _args: GeneralArgs) {
      if (!parent.name) {
        return throwError("Package name must be available to resolve versions");
      }

      const versions$ = timer(0, pollingInterval).pipe(
        switchMap(() => fetchPackageVersions(parent.name).pipe(retry(2))),
        filter(
          ({ code }: RequestResponse<PackageVersionsResponse>) => code < 300
        ),
        map(
          ({
            response: { results }
          }: RequestResponse<PackageVersionsResponse>) =>
            Object.keys(results).map(version => ({
              version,
              revision: results[version]
            }))
        )
      );

      return versions$;
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
    fetchPackageVersions,
    pollingInterval: Config.getRefreshRate()
  })
});
