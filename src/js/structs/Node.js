import Item from "./Item";
import TaskStates from "../../../plugins/services/src/js/constants/TaskStates";
import UnitHealthUtil from "../utils/UnitHealthUtil";

class Node extends Item {
  getID() {
    return this.get("id");
  }

  getServiceIDs() {
    return this.get("framework_ids");
  }

  isActive() {
    return this.get("active");
  }

  getUsageStats(resource) {
    const total = this.get("resources")[resource];
    const value = this.get("used_resources")[resource];
    const percentage = Math.round(100 * value / Math.max(1, total));

    return { percentage, total, value };
  }

  getHostName() {
    return this.get("hostname");
  }

  // Below is Component Health specific API
  // http://schema.dcos/system/health/node
  getHealth() {
    return UnitHealthUtil.getHealth(this.get("health"));
  }

  getOutput() {
    if (typeof this.get("output") === undefined) {
      return "N/A";
    }

    return this.get("output") || "OK";
  }

  sumTaskTypesByState(state) {
    let sum = 0;

    Object.keys(TaskStates).forEach(function(taskType) {
      if (TaskStates[taskType].stateTypes.indexOf(state) !== -1) {
        // Make sure there's a value
        if (this[taskType]) {
          sum += this[taskType];
        }
      }
    }, this);

    return sum;
  }
}

module.exports = Node;
