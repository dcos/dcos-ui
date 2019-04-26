declare module "graphiql" {
  import { Component, ReactElement } from "react";
  import { GraphQLSchema } from "graphql";
  import { Observable } from "rxjs";

  interface FetchConfig {
    query: string;
    variables?: object;
  }

  type Fetcher<T> = (config: FetchConfig) => Promise<T> | Observable<T>;

  interface GraphiQLProps {
    schema: GraphQLSchema;
    fetcher: Fetcher;
  }

  export default class GraphiQL extends Component<GraphiQLProps, {}> {}
}
