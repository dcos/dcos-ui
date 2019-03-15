import Item from "#SRC/js/structs/Item";

import HealthStatus from "../constants/HealthStatus";
import { NA_IMAGES } from "../constants/ServiceImages";
import ServiceStatus from "../constants/ServiceStatus";
import ServiceSpec from "./ServiceSpec";
import VolumeList from "./VolumeList";

export default class Service extends Item {
  constructor() {
    super(...arguments);
    this._regions = undefined;
  }
  getId() {
    return this.get("id") || "";
  }

  getMesosId() {
    return this.getId()
      .split("/")
      .slice(1)
      .reverse()
      .join(".");
  }

  getName() {
    return this.getId()
      .split("/")
      .pop();
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
    return new VolumeList({ items: [] });
  }

  getStatus() {
    const status = this.getServiceStatus();
    if (status.displayName == null) {
      return null;
    }

    return status.displayName;
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
    return NA_IMAGES;
  }

  getQueue() {
    return null;
  }

  getWebURL() {
    return null;
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
      tasksRunning: 0
    };
  }

  getResources() {
    const instances = this.getInstancesCount();
    const {
      cpus = 0,
      mem = 0,
      gpus = 0,
      disk = 0
    } = this.getSpec().getResources();

    return {
      cpus: cpus * instances,
      mem: mem * instances,
      gpus: gpus * instances,
      disk: disk * instances
    };
  }

  toJSON() {
    return this.get();
  }
}
