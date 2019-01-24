import PropTypes from "prop-types";
import React from "react";

import Node from "#SRC/js/structs/Node";
import NodeHealthStore from "../../stores/NodeHealthStore";
import HealthTab from "../../components/HealthTab";

class NodeDetailHealthTab extends React.Component {
  render() {
    const { node } = this.props;
    const units = NodeHealthStore.getUnits(node.hostname);

    return <HealthTab node={node} units={units} params={this.props.params} />;
  }
}

NodeDetailHealthTab.propTypes = {
  node: PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailHealthTab;
