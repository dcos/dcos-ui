import Config from "#SRC/js/config/Config";
import Item from "#SRC/js/structs/Item";
import { getWebURL } from "#PLUGINS/services/src/js/utils/ServiceUtil";

import HealthStatus from "../constants/HealthStatus";
import ServiceImages from "../constants/ServiceImages";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceSpec from "./ServiceSpec";

export default class Service extends Item {
  instances?: unknown;
  container?: {
    portMappings?: string;
  };
  portDefinitions?: string;
  resourceLimits?: {
    cpus?: "unlimited" | number;
    mem?: "unlimited" | number;
  };
  _regions = undefined;

  getId() {
    return this.get("id") || "";
  }

  getMesosId() {
    return this.getId().split("/").slice(1).join("_");
  }

  getName() {
    return this.getId().split("/").pop();
  }

  getSpec() {
    return new ServiceSpec(this.get());
  }

  getHealth() {
    return HealthStatus.NA;
  }

  getLabels() {
    return {};
  }

  getVolumes() {
    return [];
  }

  getStatus() {
    return this.getServiceStatus().displayName;
  }

  getServiceStatus() {
    return ServiceStatus.NA;
  }

  getRegions() {
    if (!this._regions) {
      const regionCounts = (this.get("tasks") || []).reduce(
        (regions, { region }) => {
          if (region) {
            regions[region] = regions[region] ? regions[region] + 1 : 1;
          }

          return regions;
        },
        {}
      );

      this._regions = Object.keys(regionCounts).sort();
    }

    return this._regions;
  }

  getImages() {
    return ServiceImages.NA_IMAGES;
  }

  getQueue() {
    return null;
  }

  getWebURL() {
    return getWebURL(this.getLabels(), Config.rootUrl);
  }

  getVersion() {
    return "";
  }

  getInstancesCount() {
    return 0;
  }

  getRunningInstancesCount() {
    return (this.get("tasks") || []).length;
  }

  getTasksSummary() {
    return {
      tasksHealthy: 0,
      tasksStaged: 0,
      tasksUnhealthy: 0,
      tasksUnknown: 0,
      tasksOverCapacity: 0,
      tasksRunning: 0,
    };
  }

  getResources() {
    const instances = this.getInstancesCount();
    const resources = this.getSpec().getResources();
    const executor = this.getSpec()?.get("executorResources");
    return {
      cpus: (resources.cpus + (executor?.cpus || 0)) * instances,
      mem: (resources.mem + (executor?.mem || 0)) * instances,
      gpus: (resources.gpus + (executor?.gpus || 0)) * instances,
      disk: (resources.disk + (executor?.disk || 0)) * instances,
    };
  }

  getRole() {
    return this.get("role") || "";
  }

  getRootGroupName() {
    return this.getId().split("/")[1];
  }

  getQuotaRoleStats(roleName, getMesosTasksByService) {
    const mesosTasks = getMesosTasksByService(this);
    const tasks = this.get("tasks");

    return mesosTasks.reduce(
      (roles, mesosTask) => {
        const item = tasks.find((t) => t.id === mesosTask.id);
        roles.count++;

        if (!item) {
          return roles;
        }

        const itemRole = item.role;
        if (itemRole) {
          roles.rolesCount++;
          if (itemRole === roleName) {
            roles.groupRoleCount++;
          }
        }
        return roles;
      },
      { count: 0, rolesCount: 0, groupRoleCount: 0 }
    );
  }
}
