import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/map";

import RepositoryList from "#SRC/js/structs/RepositoryList";
import { makeExecutableSchema } from "graphql-tools/dist/index";

// Streams we get our data from
import {
  liveFetchRepositories,
  addRepository,
  deleteRepository
} from "#PLUGINS/catalog/src/js/repositories/data/packageRepositoryClient";

export const typeDefs = `
  type PackageRepository {
    id: ID!
    name: String!
    uri: String!
  }

  type Query {
    packageRepository(filter: String): [PackageRepository!]!
  }

  type Mutation {
    addPackageRepository(name: String!, uri: String!, index: Int! ): [PackageRepository!]!
    removePackageRepository(name: String!, uri: String!): [PackageRepository!]!
  }
`;

const getRepositoryList = filter => result =>
  Object.values(
    new RepositoryList({ items: result.repositories })
      .filterItemsByText(filter)
      .getItems()
  );

export function resolvers(
  fetchRepositoriesRequest,
  addRepositoryRequest,
  deleteRepositoryRequest,
) {
  return {
    Query: {
      packageRepository: (parent, args) => {
        const { filter } = args;

        // Filter Logic Backwards compatible with the previous struct/RepositoryList
        return fetchRepositoriesRequest().map(getRepositoryList(filter));
      }
    },
    Mutation: {
      addPackageRepository: (parent, args) => {
        return addRepositoryRequest(args.name, args.uri, args.index).map(() =>
          getRepositoryList("")
        );
      },
      removePackageRepository: (parent, args) => {
        return deleteRepositoryRequest(args.name, args.uri).map(() =>
          getRepositoryList("")
        );
      }
    }
  };
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: resolvers(liveFetchRepositories, addRepository, deleteRepository)
});
