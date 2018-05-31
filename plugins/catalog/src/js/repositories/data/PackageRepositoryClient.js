import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/map";

import RepositoryList from "#SRC/js/structs/RepositoryList";
import { makeExecutableSchema } from "graphql-tools/dist/index";

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

export const resolvers = {
  Query: {
    packageRepository: (parent, args, context) => {
      const { filter } = args;

      // Filter Logic Backwards compatible with the previous struct/RepositoryList
      return context.query.packageRepository.map(getRepositoryList(filter));
    }
  },
  Mutation: {
    addPackageRepository: (parent, args, context) => {
      return context.mutation
        .addPackageRepository(args.name, args.uri, args.index)
        .map(getRepositoryList(""));
    },
    removePackageRepository: (parent, args, context) => {
      return context.mutation
        .removePackageRepository(args.name, args.uri)
        .map(getRepositoryList(""));
    }
  }
};

export const defaultSchema = makeExecutableSchema({
  typeDefs,
  resolvers
});
