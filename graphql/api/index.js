import { makeExecutableSchema } from 'graphql-tools';

import schema from './schema';
import resolvers from './resolvers';

export default makeExecutableSchema({
  typeDefs: [schema],
  resolvers
});
