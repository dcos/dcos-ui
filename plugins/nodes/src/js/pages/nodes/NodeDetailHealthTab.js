/* @flow */
import React from "react";
import { routerShape } from "react-router";

import Node from "#SRC/js/structs/Node";
import NodeHealthStore from "../../stores/NodeHealthStore";
import HealthTab from "../../components/HealthTab";

type Props = { node: Node };

class NodeDetailHealthTab extends React.Component {

  render() {
    const { node } = this.props;
    const units = NodeHealthStore.getUnits(node.hostname);

    return <HealthTab node={node} units={units} params={this.props.params} />;
  }
}

NodeDetailHealthTab.contextTypes = {
  router: routerShape
};

module.exports = NodeDetailHealthTab;
