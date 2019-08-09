import React from "react";
import { i18nMark } from "@lingui/react";
import Helmet from "react-helmet";

import Page from "#SRC/js/components/Page";
import NodeBreadcrumbs from "../components/NodeBreadcrumbs";
import MesosMasters from "../data/MesosMasters";

const NodesMastersPage = ({ children }) => {
  const tabs = [
    { label: i18nMark("Agents"), routePath: "/nodes/agents" },
    { label: i18nMark("Masters"), routePath: "/nodes/masters" }
  ];

  return (
    <Page>
      <Page.Header breadcrumbs={<NodeBreadcrumbs />} tabs={tabs} />
      {children}
    </Page>
  );
};

export default class NodesMasters extends React.Component {
  render() {
    return (
      <NodesMastersPage>
        <Helmet>
          <title>{`${i18nMark("Nodes Masters")} - ${i18nMark("Nodes")}`}</title>
        </Helmet>
        <MesosMasters />
      </NodesMastersPage>
    );
  }
}
