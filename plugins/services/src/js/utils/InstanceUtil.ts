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
    if (!task?.agentId) {
      return null;
    }

    return CompositeState.getNodesList()
      .filter({ ids: [task.agentId] })
      .last();
  },
};

export default InstanceUtil;
