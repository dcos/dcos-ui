import { of, throwError } from "rxjs";
import { map, retry, switchMap } from "rxjs/operators";
import { makeExecutableSchema } from "graphql-tools";
import { CosmosClient } from "cosmos-client";

import { PackageSchema } from "#SRC/js/data/cosmos/Package";
import { PackageVersionSchema } from "#SRC/js/data/cosmos/PackageVersion";

export { schema as default, PackageQueryArgs };

type PossibleQueryArgs = Partial<PackageQueryArgs>;

type PackageQueryArgs = {
  name: string;
};

function isPackageQueryArgs(args: PossibleQueryArgs): args is PackageQueryArgs {
  return typeof args.name === "string";
}

const resolvers = {
  Package: {
    versions(parent: { name: string }) {
      if (typeof parent.name !== "string" || parent.name.length === 0) {
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
    package(_parent: {}, args: PossibleQueryArgs = {}) {
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

const schema = makeExecutableSchema({
  typeDefs: [PackageVersionSchema, PackageSchema, baseSchema],
  resolvers
});
