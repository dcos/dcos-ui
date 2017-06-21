import Item from "../../../../../src/js/structs/Item";

module.exports = class PodContainerTerminationHistory extends Item {
  getId() {
    return this.get("containerId");
  }

  getLastKnownState() {
    return this.get("lastKnownState") || "unknown";
  }

  getTermination() {
    return (
      this.get("termination") || {
        exitCode: 0,
        message: ""
      }
    );
  }
};
