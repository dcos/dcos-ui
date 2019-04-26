import React from "react";
import GraphiQL from "graphiql";
import "graphiql/graphiql.css";
import gql from "graphql-tag";
import { map } from "rxjs/operators";

import { DataLayerType, DataLayer } from "@extension-kid/data-layer";
import { componentFromStream } from "@dcos/data-service";

import container from "#SRC/js/container";

const dataLayer = container.get<DataLayer>(DataLayerType);
const schema$ = dataLayer.getExecutableSchema$();

const fetcher = ({
  query,
  variables = {}
}: {
  query: string;
  variables?: object;
}) => {
  return dataLayer.query(
    gql`
      ${query}
    `,
    variables
  );
};
const DynamicGraphiQL = componentFromStream(_ =>
  schema$.pipe(map(schema => <GraphiQL schema={schema} fetcher={fetcher} />))
);

export default DynamicGraphiQL;
