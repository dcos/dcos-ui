import React from "react";
import Page from "#SRC/js/components/Page";
import NodeBreadcrumbs from "../components/NodeBreadcrumbs";
import MesosMasters from "../data/MesosMasters";

const NodesMastersPage = ({ children }) => {
  return (
    <Page>
      <Page.Header
        breadcrumbs={<NodeBreadcrumbs />}
        tabs={[
          { label: "Agents", routePath: "/nodes/agents" },
          { label: "Masters", routePath: "/nodes/masters" }
        ]}
      />
      {children}
    </Page>
  );
};

export default class NodesMasters extends React.Component {
  render() {
    return (
      <NodesMastersPage>
        <MesosMasters />
      </NodesMastersPage>
    );
  }
}
