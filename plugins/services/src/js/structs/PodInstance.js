import Item from "../../../../../src/js/structs/Item";
import PodContainer from "./PodContainer";
import PodContainerStatus from "../constants/PodContainerStatus";
import PodInstanceStatus from "../constants/PodInstanceStatus";
import PodInstanceState from "../constants/PodInstanceState";
import StringUtil from "../../../../../src/js/utils/StringUtil";

module.exports = class PodInstance extends Item {
  getAgentAddress() {
    return this.get("agentHostname") || "";
  }

  getContainers() {
    const containers = this.get("containers") || [];

    return containers.map(container => {
      return new PodContainer(container);
    });
  }

  getId() {
    return this.get("id") || "";
  }

  getName() {
    return this.getId();
  }

  getStatus() {
    // API returns mix of uppercase and lowercase depending on status :(
    return this.get("status").toLowerCase();
  }

  getInstanceStatus() {
    switch (this.getStatus()) {
      case PodInstanceState.PENDING:
        return PodInstanceStatus.STAGED;

      case PodInstanceState.STAGING:
        return PodInstanceStatus.STAGED;

      case PodInstanceState.STABLE:
        if (this.hasHealthChecks()) {
          if (this.isHealthy()) {
            return PodInstanceStatus.HEALTHY;
          } else {
            return PodInstanceStatus.UNHEALTHY;
          }
        } else {
          return PodInstanceStatus.RUNNING;
        }

      case PodInstanceState.DEGRADED:
        return PodInstanceStatus.UNHEALTHY;

      case PodInstanceState.TERMINAL:
        // If all containers are in completed state, mark us as completed
        const containers = this.getContainers();
        const isFinished =
          containers.length > 0 &&
          containers.every(function(container) {
            return (
              container.getContainerStatus() === PodContainerStatus.FINISHED
            );
          });

        if (isFinished) {
          return PodInstanceStatus.FINISHED;
        }

        return PodInstanceStatus.KILLED;

      default:
        return Object.assign(Object.create(PodInstanceStatus.NA), {
          displayName: StringUtil.capitalize(this.getStatus())
        });
    }
  }

  getLastChanged() {
    return new Date(this.get("lastChanged"));
  }

  getLastUpdated() {
    return new Date(this.get("lastUpdated"));
  }

  getResources() {
    const resources = this.get("resources") || {};

    return Object.assign(
      {
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      },
      resources
    );
  }

  hasHealthChecks() {
    // If for any reason any of the containers has at least 1 health
    // check that is failing, assume that we have health checks
    if (!this.isHealthy()) {
      return true;
    }

    // If we have no containers, return false
    const containers = this.getContainers();
    if (!containers.length) {
      return false;
    }

    // Otherwise ALL container must have health checks in order to be
    // considered healthy.
    return containers.every(function(container) {
      return container.hasHealthChecks();
    });
  }

  isHealthy() {
    if (this.getStatus() !== PodInstanceState.STABLE) {
      return false;
    }

    return this.getContainers().every(function(container) {
      return container.isHealthy();
    });
  }

  isRunning() {
    const status = this.getStatus();

    return (
      status === PodInstanceState.STABLE || status === PodInstanceState.DEGRADED
    );
  }

  isStaging() {
    const status = this.getStatus();

    return (
      status === PodInstanceState.PENDING || status === PodInstanceState.STAGING
    );
  }

  isTerminating() {
    return this.getStatus() === PodInstanceState.TERMINAL;
  }
};
