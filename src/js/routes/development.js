import React, { lazy, Suspense } from "react";

const GraphiQL = lazy(() =>
  import(/* webpackChunkName: "graphiql" */ "#SRC/js/components/GraphiQL")
);

function GraphiQLWrapper() {
  return (
    <div style={{ width: "100%", backgroundColor: "#FFF" }}>
      <Suspense fallback={<div />}>
        <GraphiQL />
      </Suspense>
    </div>
  );
}

GraphiQLWrapper.routeConfig = {
  label: "GraphiQL",
  matches: /^\/development\/graphiql/
};

export default function({ RoutingService }, { NavigationService }) {
  RoutingService.registerPage("graphiql", GraphiQLWrapper);

  NavigationService.registerPrimary("/graphiql", "GraphiQL", {
    category: "root",
    icon: <span>🚒</span>
  });
}
