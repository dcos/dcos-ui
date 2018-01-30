/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import CompositeState from "#SRC/js/structs/CompositeState";

const InstanceUtil = {
  getRegionName(task) {
    const node = this.getNode(task);

    if (!node) {
      return "N/A";
    }

    const nodeRegionName = node.getRegionName();
    const masterNode = CompositeState.getMasterNode();

    if (
      masterNode &&
      nodeRegionName === masterNode.getRegionName() &&
      nodeRegionName !== "N/A"
    ) {
      return `${nodeRegionName} (Local)`;
    }

    return nodeRegionName;
  },

  getZoneName(task) {
    const node = this.getNode(task);

    if (!node) {
      return "N/A";
    }

    return node.getZoneName();
  },

  getNode(task) {
    const nodesList = CompositeState.getNodesList();
    const id = (task && task.agent && task.agent.id) || null;
    const node = nodesList
      .filter({
        ids: [id]
      })
      .last();

    return node;
  }
};

module.exports = InstanceUtil;
