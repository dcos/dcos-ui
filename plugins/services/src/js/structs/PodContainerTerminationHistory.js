import Item from "#SRC/js/structs/Item";

export default class PodContainerTerminationHistory extends Item {
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
}
