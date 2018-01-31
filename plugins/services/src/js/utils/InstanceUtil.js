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
    if (!task) {
      return null;
    }

    const nodesList = CompositeState.getNodesList();
    let id = null;

    if (task.agent && task.agent.id) {
      id = task.agent.id;
    } else if (task.agentId) {
      id = task.agentId;
    }

    const node = nodesList
      .filter({
        ids: [id]
      })
      .last();

    return node;
  }
};

module.exports = InstanceUtil;
