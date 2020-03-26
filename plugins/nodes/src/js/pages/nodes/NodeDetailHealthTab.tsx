import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";

import Node from "#SRC/js/structs/Node";
import NodeHealthStore from "../../stores/NodeHealthStore";
import HealthTab from "../../components/HealthTab";

const NodeDetailHealthTab = (props) => {
  const { node } = props;
  if (!node) {
    return null;
  }
  const units = NodeHealthStore.getUnits(node.hostname);

  return <HealthTab node={node} units={units} params={props.params} />;
};

NodeDetailHealthTab.contextTypes = {
  router: routerShape,
};

NodeDetailHealthTab.propTypes = {
  node: PropTypes.instanceOf(Node),
};

export default NodeDetailHealthTab;
