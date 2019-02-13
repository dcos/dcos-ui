import { map } from "rxjs/operators";
import RepositoryList from "#SRC/js/structs/RepositoryList";
import { makeExecutableSchema } from "graphql-tools/dist/index";
import { injectable, decorate } from "inversify";

// Streams we get our data from
import {
  liveFetchRepositories,
  addRepository,
  deleteRepository
} from "#PLUGINS/catalog/src/js/repositories/data/PackageRepositoryClient";

export const typeDefs = `
  type PackageRepository {
    id: ID!
    name: String!
    uri: String!
    index: Int!
  }

  type Query {
    packageRepository(filter: String): [PackageRepository!]!
  }

  type Mutation {
    addPackageRepository(name: String!, uri: String!, index: Int! ): [PackageRepository!]!
    removePackageRepository(name: String!, uri: String!, index: Int!): [PackageRepository!]!
  }
`;

const getRepositoryList = filter => ({ response }) =>
  Object.values(
    new RepositoryList({ items: response.repositories })
      .filterItemsByText(filter)
      .getItems()
  );

export function resolvers({
  liveFetchRepositories,
  addRepository,
  deleteRepository
}) {
  return {
    Query: {
      packageRepository: (parent, args) => {
        const { filter } = args;

        // Filter Logic Backwards compatible with the previous struct/RepositoryList
        return liveFetchRepositories().pipe(map(getRepositoryList(filter)));
      }
    },
    Mutation: {
      addPackageRepository: (parent, args) => {
        return addRepository(args.name, args.uri, args.index).pipe(
          map(getRepositoryList(""))
        );
      },
      removePackageRepository: (parent, args) => {
        return deleteRepository(args.name, args.uri).pipe(
          map(getRepositoryList(""))
        );
      }
    }
  };
}

const boundResolvers = resolvers({
  liveFetchRepositories,
  addRepository,
  deleteRepository
});

// TODO: remove once moce to DL is done
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: boundResolvers
});

const RepositoryType = Symbol("Repository");
// tslint:disable-next-line

class RepositoryExtension {
  constructor() {
    this.id = RepositoryType;
  }

  getResolvers() {
    return boundResolvers;
  }

  getTypeDefinitions() {
    return typeDefs;
  }
}

export const InjectableRepositoryExtension = decorate(
  injectable(),
  RepositoryExtension
);
