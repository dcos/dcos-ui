import HealthStatus from "../constants/HealthStatus";
import PodInstanceList from "./PodInstanceList";
import PodSpec from "./PodSpec";
import PodState from "../constants/PodState";
import PodTerminationHistoryList from "./PodTerminationHistoryList";
import Service from "./Service";
import ServiceStatus from "../constants/ServiceStatus";
import ServiceImages from "../constants/ServiceImages";

module.exports = class Pod extends Service {
  constructor() {
    super(...arguments);

    // For performance reasons we are creating only a single
    // instance of the pod spec (instead of creating a new
    // instance every time the user calls `getSpec()`)
    //
    // The variable is prefixed because `Item` will expose
    // all the properties it gets as a properties of this object
    // and we want to avoid any naming collisions.
    //
    this._spec = new PodSpec(this.get("spec"));
  }

  countRunningInstances() {
    return this.getInstanceList().reduceItems(function(counter, instance) {
      if (instance.isRunning()) {
        return counter + 1;
      }

      return counter;
    }, 0);
  }

  countNonTerminalInstances() {
    return this.getInstanceList().reduceItems(function(counter, instance) {
      if (!instance.isTerminating()) {
        return counter + 1;
      }

      return counter;
    }, 0);
  }

  countTotalInstances() {
    return (this.get("instances") || []).length;
  }

  /**
   * Return the normalized pod ID, used as a prefix in the marathon framework
   * state, as fetched from Mesos state.
   *
   * @override
   * @returns {String} The normalized mesos ID
   */
  getMesosId() {
    const id = this.getId().substr(1);

    return id.replace(/\//g, "_");
  }

  /**
   * @override
   */
  getHealth() {
    switch (this.get("status")) {
      // DEGRADED - The number of STABLE pod instances is less than the number
      // of desired instances.
      case PodState.DEGRADED:
        return HealthStatus.UNHEALTHY;
      // STABLE   - All launched pod instances have started and, if health
      // checks were specified, are all healthy.
      case PodState.STABLE:
        return HealthStatus.HEALTHY;
      // TERMINAL - Marathon is tearing down all of the instances for this pod.
      case PodState.TERMINAL:
        return HealthStatus.NA;

      default:
        return HealthStatus.NA;
    }
  }

  /**
   * @override
   */
  getImages() {
    return ServiceImages.NA_IMAGES;
  }

  /**
   * @override
   */
  getInstancesCount() {
    // Apparently this means 'get total number of scheduled instances'
    return this.getSpec().getScalingInstances();
  }

  getInstanceList() {
    return new PodInstanceList({ items: this.get("instances") || [] });
  }

  getQueue() {
    return this.get("queue");
  }

  /**
   * @override
   */
  getLabels() {
    return this.getSpec().getLabels();
  }

  getLastChanged() {
    return new Date(this.get("lastChanged"));
  }

  getLastUpdated() {
    return new Date(this.get("lastUpdated"));
  }

  /**
   * @override
   */
  getServiceStatus() {
    const scalingInstances = this.getSpec().getScalingInstances();
    const runningInstances = this.countRunningInstances();
    const nonterminalInstances = this.countNonTerminalInstances();

    if (nonterminalInstances === 0 && scalingInstances === 0) {
      return ServiceStatus.SUSPENDED;
    }

    if (scalingInstances !== nonterminalInstances) {
      return ServiceStatus.DEPLOYING;
    }

    if (runningInstances > 0) {
      return ServiceStatus.RUNNING;
    }

    return ServiceStatus.NA;
  }

  /**
   * @override
   */
  getSpec() {
    return this._spec;
  }

  /**
   * @override
   */
  getTasksSummary() {
    const taskSummary = {
      tasksHealthy: 0,
      tasksUnhealthy: 0,
      tasksStaged: 0,
      tasksRunning: 0,
      tasksUnknown: 0,
      tasksOverCapacity: 0
    };

    this.getInstanceList().mapItems(function(instance) {
      if (instance.isRunning()) {
        taskSummary.tasksRunning++;
        if (instance.hasHealthChecks()) {
          if (instance.isHealthy()) {
            taskSummary.tasksHealthy++;
          } else {
            taskSummary.tasksUnhealthy++;
          }
        } else {
          taskSummary.tasksUnknown++;
        }
      } else if (instance.isStaging()) {
        taskSummary.tasksStaged++;
      }
    });

    const totalInstances = taskSummary.tasksStaged + taskSummary.tasksRunning;
    const definedInstances = this.getSpec().getScalingInstances();

    if (totalInstances > definedInstances) {
      taskSummary.tasksOverCapacity = totalInstances - definedInstances;
    }

    return taskSummary;
  }

  getTerminationHistoryList() {
    return new PodTerminationHistoryList({
      items: this.get("terminationHistory") || []
    });
  }
};
