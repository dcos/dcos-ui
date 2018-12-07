import { graphqlObservable } from "data-service";
import { makeExecutableSchema } from "graphql-tools";
import { Observable } from "rxjs/Observable";

const baseSchema = makeExecutableSchema({
  typeDefs: `
  type Query {
  }

  type Mutation {
  }
  `,
  resolvers: {}
});
export default function graphql(doc: any, context: any): Observable<any> {
  return graphqlObservable(doc, baseSchema, context);
}
