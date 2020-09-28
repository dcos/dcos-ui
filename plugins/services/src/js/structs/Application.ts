import { cleanServiceJSON } from "#SRC/js/utils/CleanJSONUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import ApplicationSpec from "./ApplicationSpec";
import FrameworkUtil from "../utils/FrameworkUtil";
import HealthStatus from "../constants/HealthStatus";
import Service from "./Service";
import * as ServiceStatus from "../constants/ServiceStatus";
import TaskStats from "./TaskStats";

export default class Application extends Service {
  // The variable is prefixed because `Item` will expose all the properties
  // it gets as a properties of this object and we want to avoid any naming
  // collisions.
  _spec: ApplicationSpec | null = null;

  /**
   * @override
   */
  getSpec() {
    if (this._spec == null) {
      // State and other _useless_ information is removed to create a clean
      // service spec.
      this._spec = new ApplicationSpec(cleanServiceJSON(this.get()));
    }

    return this._spec;
  }

  /**
   * @override
   */
  getHealth() {
    const {
      tasksHealthy,
      tasksUnhealthy,
      tasksRunning,
    } = this.getTasksSummary();
    const healthChecks = this.getSpec().getHealthChecks();

    if (tasksUnhealthy > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (tasksRunning > 0 && tasksHealthy === tasksRunning) {
      return HealthStatus.HEALTHY;
    }

    if (healthChecks && tasksRunning === 0) {
      return HealthStatus.IDLE;
    }

    return HealthStatus.NA;
  }

  /**
   * @override
   */
  getImages() {
    const images =
      FrameworkUtil.getMetadataFromLabels(this.getLabels()).images ||
      this.get("images");

    return FrameworkUtil.getServiceImages(images);
  }

  /**
   * @override
   */
  getInstancesCount() {
    return this.get("instances") || 0;
  }

  /**
   * @override
   */
  getLabels() {
    return this.getSpec().getLabels() || {};
  }

  getLastTaskFailure() {
    return this.get("lastTaskFailure");
  }

  getName() {
    return this.getId().split("/").pop();
  }

  getPorts() {
    return this.get("ports");
  }

  getStatus() {
    return this.getServiceStatus().displayName;
  }

  /**
   * @override
   */
  getServiceStatus() {
    const env = this.get("env");

    if (env && env.SDK_UNINSTALL) {
      return ServiceStatus.DELETING;
    }

    const { tasksRunning } = this.getTasksSummary();
    const deployments = this.get("deployments");
    const queue = this.getQueue();
    const instances = this.getInstancesCount();

    if (instances === 0 && tasksRunning === 0) {
      return ServiceStatus.STOPPED;
    }

    if (this.isDelayed()) {
      return ServiceStatus.DELAYED;
    }

    if (queue != null && (deployments == null || deployments.length < 1)) {
      return ServiceStatus.RECOVERING;
    }

    if (queue != null && queue.delay) {
      return ServiceStatus.DEPLOYING;
    }

    if (deployments != null && deployments.length > 0) {
      return ServiceStatus.DEPLOYING;
    }

    if (tasksRunning > 0) {
      return ServiceStatus.RUNNING;
    }

    return ServiceStatus.NA;
  }

  /**
   * @override
   */
  getTasksSummary() {
    const healthData = {
      tasksHealthy: this.get("tasksHealthy"),
      tasksStaged: this.get("tasksStaged"),
      tasksUnhealthy: this.get("tasksUnhealthy"),
      tasksUnknown: Math.max(
        0,
        this.get("tasksRunning") -
          this.get("tasksHealthy") -
          this.get("tasksUnhealthy")
      ),
    };

    const tasksSum = Object.keys(healthData).reduce(
      (sum, healthItem) => sum + healthData[healthItem],
      0
    );

    healthData.tasksOverCapacity = Math.max(
      0,
      tasksSum - this.getInstancesCount()
    );
    healthData.tasksRunning = this.get("tasksRunning");

    return healthData;
  }

  getTaskStats() {
    return new TaskStats(this.get("taskStats"));
  }

  getQueue() {
    return this.get("queue");
  }

  getVersion() {
    return this.get("version");
  }

  getVersions() {
    return this.get("versions") || new Map();
  }

  getVersionInfo() {
    const currentVersionID = this.get("version");
    const { lastConfigChangeAt, lastScalingAt } = this.get("versionInfo");

    return { lastConfigChangeAt, lastScalingAt, currentVersionID };
  }

  /**
   * @override
   */
  getVolumes() {
    return this.get("volumes") || [];
  }

  findTaskById(taskId) {
    return (this.get("tasks") || []).find((task) => task.id === taskId);
  }

  isDelayed() {
    const queue = this.getQueue();
    return findNestedPropertyInObject(queue, "delay.overdue") === false;
  }
}
