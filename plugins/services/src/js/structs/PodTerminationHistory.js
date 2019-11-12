import Item from "#SRC/js/structs/Item";
import PodContainerTerminationHistory from "./PodContainerTerminationHistory";

module.exports = class PodTerminationHistory extends Item {
  getContainers() {
    const containers = this.get("containers") || [];

    return containers.map(container => {
      return new PodContainerTerminationHistory(container);
    });
  }

  getId() {
    return this.get("instanceID");
  }

  getMessage() {
    return this.get("message") || "Pod terminated";
  }

  getStartedAt() {
    return new Date(this.get("startedAt"));
  }

  getTerminatedAt() {
    return new Date(this.get("terminatedAt"));
  }
};
