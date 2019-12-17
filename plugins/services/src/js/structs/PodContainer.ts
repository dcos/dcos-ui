import Item from "#SRC/js/structs/Item";
import PodContainerStatus from "../constants/PodContainerStatus";
import PodContainerState from "../constants/PodContainerState";

export default class PodContainer extends Item {
  getContainerStatus() {
    switch (this.get("status")) {
      case PodContainerState.RUNNING:
        if (this.hasHealthChecks()) {
          if (this.isHealthy()) {
            return PodContainerStatus.HEALTHY;
          }
          return PodContainerStatus.UNHEALTHY;
        }
        return PodContainerStatus.RUNNING;

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
    return {
      cpus: 0,
      mem: 0,
      gpus: 0,
      disk: 0,
      ...this.get("resources")
    };
  }

  hasHealthChecks() {
    const conditions = this.get("conditions");

    // According to RAML specs:
    //
    // https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/container-status.raml#L49
    // 'healthy: should only be present if a health check is defined for this endpoint'
    //
    return (
      conditions &&
      Array.isArray(conditions) &&
      conditions.some(cnd => cnd.name === "healthy")
    );
  }

  isHealthy() {
    if (this.hasHealthChecks()) {
      // If we have at least 1 health check and it has failed, we are assumed to
      // be unhealthy.
      return !this.get("conditions").some(
        cnd => cnd.name === "healthy" && cnd.value === "false"
      );
    }
    return true;
  }
}
