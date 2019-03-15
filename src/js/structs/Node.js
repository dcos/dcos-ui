import Item from "./Item";
import TaskStates from "../../../plugins/services/src/js/constants/TaskStates";
import UnitHealthUtil from "../utils/UnitHealthUtil";
import { findNestedPropertyInObject } from "../utils/Util";

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

  getDomain() {
    return this.get("domain");
  }

  getRegionName() {
    const nodeRegionName = findNestedPropertyInObject(
      this.getDomain(),
      "fault_domain.region.name"
    );

    return nodeRegionName || "N/A";
  }

  getZoneName() {
    const nodeZoneName = findNestedPropertyInObject(
      this.getDomain(),
      "fault_domain.zone.name"
    );

    return nodeZoneName || "N/A";
  }

  getUsageStats(resource) {
    const total = (this.get("resources") || {})[resource];
    const value = (this.get("used_resources") || {})[resource];

    if (total === undefined || value === undefined) {
      return { percentage: 0, total: 0, value: 0 };
    }

    const percentage = Math.round((100 * value) / Math.max(1, total));

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
      if (
        TaskStates[taskType] &&
        TaskStates[taskType].stateTypes.indexOf(state) !== -1
      ) {
        // Make sure there's a value
        if (this[taskType]) {
          sum += this[taskType];
        }
      }
    }, this);

    return sum;
  }

  getResources() {
    return (
      this.get("used_resources") || {
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      }
    );
  }

  isPublic() {
    return (
      findNestedPropertyInObject(this.get("attributes"), "public_ip") === "true"
    );
  }

  getIp() {
    return this.get("host_ip") || this.getHostName();
  }

  getPublicIps() {
    if (!this.get("network")) {
      return [];
    }

    return this.get("network").public_ips || [];
  }
}

export default Node;
