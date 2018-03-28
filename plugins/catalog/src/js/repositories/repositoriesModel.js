import "rxjs/add/operator/combineLatest";

import RepositoryList from "#SRC/js/structs/RepositoryList";

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
    addPackageRepository(uri: String!, name: String!): PackageRepository
  }
`;

export const resolvers = {
  Query: {
    packageRepository: (parent, args, context) => {
      const { filter } = args;

      // Filter Logic Backwards compatible with the previous struct/RepositoryList
      return context.query.combineLatest(filter, (result, filter) =>
        Object.values(
          new RepositoryList({ items: result.repositories })
            .filterItemsByText(filter)
            .getItems()
        )
      );
    }
  },
  Mutation: {}
};
