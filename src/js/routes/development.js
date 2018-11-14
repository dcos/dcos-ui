import React from "react";
import { Route } from "react-router";
import { i18nMark } from "@lingui/react";

import JobModel from "#PLUGINS/jobs/src/js/data/JobModel";
import { graphqlObservable } from "data-service";
import gql from "graphql-tag";
import GraphiQL from "graphiql";
import "graphiql/graphiql.css";

class DevelopmentPage extends React.Component {
  render() {
    return this.props.children;
  }
}

DevelopmentPage.routeConfig = {
  label: "Development",
  icon: <span>XXX</span>,
  matches: /^\/development/
};

// eslint-disable-next-line
function GraphiQLWrapper() {
  // our graphql has no introspection currently, so we need to get the schema
  // we need to have some sort of "select" for this somewhere (we also got the repositories model)
  const schema = JobModel;
  // fetcher seems to be able to handle observables
  const fetcher = ({ query, variables }) => {
    const q = gql`
      ${query}
    `;

    return graphqlObservable(q, schema, variables);
  };

  return (
    <div id="isolator" style={{ width: "100%" }}>
      <GraphiQL
        defaultQuery={`{
            jobs(path: "") {
              path
              filteredCount
              totalCount
              nodes
            }
          }
      `}
        fetcher={fetcher}
        schema={schema}
      />
    </div>
  );
}
GraphiQLWrapper.routeConfig = {
  label: i18nMark("GraphiQL"),
  matches: /^\/development\/graphiql/
};

const devRoutes = [
  {
    type: Route,
    path: "development",
    component: DevelopmentPage,
    category: i18nMark("system"),
    isInSidebar: true,
    children: [
      {
        type: Route,
        path: "GraphiQL",
        component: GraphiQLWrapper,
        isInSidebar: true
      }
    ]
  }
];

module.exports = devRoutes;
