import ApplicationSpec from "./ApplicationSpec";
import Config from "../../../../../src/js/config/Config";
import { cleanServiceJSON } from "../../../../../src/js/utils/CleanJSONUtil";
import FrameworkUtil from "../utils/FrameworkUtil";
import HealthStatus from "../constants/HealthStatus";
import Service from "./Service";
import ServiceStatus from "../constants/ServiceStatus";
import TaskStats from "./TaskStats";
import VolumeList from "./VolumeList";

module.exports = class Application extends Service {
  constructor() {
    super(...arguments);

    // For performance reasons only one instance of the spec is created
    // instead of creating a new instance every time a user calls `getSpec()`.
    //
    // State and other _useless_ information is removed to create a clean
    // service spec.
    //
    // The variable is prefixed because `Item` will expose all the properties
    // it gets as a properties of this object and we want to avoid any naming
    // collisions.
    this._spec = new ApplicationSpec(cleanServiceJSON(this.get()));
  }

  getDeployments() {
    return this.get("deployments");
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
  getHealth() {
    const {
      tasksHealthy,
      tasksUnhealthy,
      tasksRunning
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
    return FrameworkUtil.getServiceImages(this.getMetadata().images);
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

  getLastConfigChange() {
    return this.getVersionInfo().lastConfigChangeAt;
  }

  getLastScaled() {
    return this.getVersionInfo().lastScalingAt;
  }

  getLastTaskFailure() {
    return this.get("lastTaskFailure");
  }

  getMetadata() {
    return FrameworkUtil.getMetadataFromLabels(this.getLabels());
  }

  getName() {
    return this.getId().split("/").pop();
  }

  getPorts() {
    return this.get("ports");
  }

  getResidency() {
    return this.get("residency");
  }

  getStatus() {
    const status = this.getServiceStatus();
    if (status.displayName == null) {
      return null;
    }

    return status.displayName;
  }

  /**
   * @override
   */
  getServiceStatus() {
    const { tasksRunning } = this.getTasksSummary();
    const deployments = this.getDeployments();
    const queue = this.getQueue();

    const instances = this.getInstancesCount();
    if (instances === 0 && tasksRunning === 0) {
      return ServiceStatus.SUSPENDED;
    }

    if (queue != null && queue.delay) {
      if (queue.delay.overdue) {
        return ServiceStatus.WAITING;
      }

      return ServiceStatus.DELAYED;
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
      )
    };

    const tasksSum = Object.keys(healthData).reduce(function(sum, healthItem) {
      return sum + healthData[healthItem];
    }, 0);

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
    return new VolumeList({ items: this.get("volumes") || [] });
  }

  /**
   * @override
   */
  getWebURL() {
    const {
      DCOS_SERVICE_NAME,
      DCOS_SERVICE_PORT_INDEX,
      DCOS_SERVICE_SCHEME
    } = this.getLabels() || {};

    const serviceName = encodeURIComponent(DCOS_SERVICE_NAME);

    if (!serviceName || !DCOS_SERVICE_PORT_INDEX || !DCOS_SERVICE_SCHEME) {
      return null;
    }

    return `${Config.rootUrl}/service/${serviceName}/`;
  }
};
