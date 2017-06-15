import Item from "../../../../../src/js/structs/Item";
import PodContainerStatus from "../constants/PodContainerStatus";
import PodContainerState from "../constants/PodContainerState";

module.exports = class PodContainer extends Item {
  getContainerStatus() {
    switch (this.get("status")) {
      case PodContainerState.RUNNING:
        if (this.hasHealthChecks()) {
          if (this.isHealthy()) {
            return PodContainerStatus.HEALTHY;
          } else {
            return PodContainerStatus.UNHEALTHY;
          }
        } else {
          return PodContainerStatus.RUNNING;
        }
      case PodContainerState.STAGING:
        return PodContainerStatus.STAGING;
      case PodContainerState.STARTING:
        return PodContainerStatus.STARTING;
      case PodContainerState.STARTED:
        return PodContainerStatus.STARTED;
      case PodContainerState.KILLING:
        return PodContainerStatus.KILLING;
      case PodContainerState.FINISHED:
        return PodContainerStatus.FINISHED;
      case PodContainerState.KILLED:
        return PodContainerStatus.KILLED;
      case PodContainerState.FAILED:
        return PodContainerStatus.FAILED;
      case PodContainerState.LOST:
        return PodContainerStatus.LOST;
      case PodContainerState.ERROR:
        return PodContainerStatus.ERROR;
      default:
        return PodContainerStatus.NA;
    }
  }

  getEndpoints() {
    return this.get("endpoints") || [];
  }

  getId() {
    return this.get("containerId") || "";
  }

  getLastChanged() {
    return new Date(this.get("lastChanged") || "");
  }

  getLastUpdated() {
    return new Date(this.get("lastUpdated") || "");
  }

  getName() {
    return this.get("name") || "";
  }

  getResources() {
    return Object.assign(
      {
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      },
      this.get("resources")
    );
  }

  hasHealthChecks() {
    // According to RAML specs:
    //
    // https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/container-status.raml#L49
    // 'healthy: should only be present if a health check is defined for this endpoint'
    //
    const endpoints = this.getEndpoints();
    let allHaveChecks = endpoints.length > 0;
    let hasFailure = false;

    this.getEndpoints().forEach(function(ep) {
      if (ep.healthy === undefined) {
        allHaveChecks = false;
      }
      if (ep.healthy === false) {
        hasFailure = true;
      }
    });

    return allHaveChecks || hasFailure;
  }

  isHealthy() {
    // If we have at least 1 health check and it has failed, we are assumed to
    // be unhealthy.
    return !this.getEndpoints().some(function(ep) {
      return ep.healthy !== undefined && !ep.healthy;
    });
  }
};
