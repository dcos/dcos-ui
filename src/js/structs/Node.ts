import Item from "./Item";
import UnitHealthUtil from "../utils/UnitHealthUtil";
import { findNestedPropertyInObject } from "../utils/Util";

type Stats = {
  cpus: number;
  mem: number;
  gpus: number;
  disk: number;
};

class Node extends Item {
  resources?: Stats;
  usedResources?: Stats;

  getID() {
    return this.get("id");
  }

  getEncodedID() {
    const id = this.get("id");
    if (!id) {
      return null;
    }
    const trimmedNodeID = decodeURIComponent(id).replace(/^\//, "");

    return encodeURIComponent(trimmedNodeID);
  }

  getDrainInfo() {
    return this.get("drain_info");
  }

  isActive() {
    return this.get("active");
  }

  isDeactivated() {
    return this.get("deactivated");
  }

  getDomain() {
    return this.get("domain");
  }

  getRegionName() {
    return this.domain?.fault_domain?.region?.name || "N/A";
  }

  getZoneName() {
    const nodeZoneName = findNestedPropertyInObject(
      this.getDomain(),
      "fault_domain.zone.name"
    );

    return nodeZoneName || "N/A";
  }

  getUsageStats(resource: keyof Stats) {
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
    return this.get("network")?.public_ips || [];
  }
}

export default Node;
