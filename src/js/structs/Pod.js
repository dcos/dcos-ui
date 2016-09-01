import HealthStatus from '../constants/HealthStatus';
import PodSpec from './PodSpec';
import Service from './Service';
import ServiceStatus from '../Constants/ServiceStatus';
import ServiceImages from '../constants/ServiceImages';

const PODSTATUS_TO_HEALTH_MAP = {
  DEGRADED: 'tasksUnhealthy',
  PENDING: 'tasksUnknown',
  STAGING: 'tasksStaged',
  STABLE: 'tasksHealthy',
  TERMINAL: 'tasksUnknown'
};

module.exports = class Pod extends Service {
  constructor() {
    super(...arguments);

    // Create a spec singleton
    this._spec = new PodSpec(this.get('spec'));
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
    switch (this.get('status')) {
      // DEGRADED - The number of STABLE pod instances is less than the number of desired instances.
      case 'DEGRADED':
        return HealthStatus.UNHEALTHY;
      // STABLE   - All launched pod instances have started and, if health checks were specified, are all healthy.
      case 'STABLE':
        return HealthStatus.HEALTHY;
      // TERMINAL - Marathon is tearing down all of the instances for this pod.
      case 'TERMINAL':
        return HealthStatus.NA;
      default:
        return HealthStatus.NA;
    }
  }

  /**
   * @override
   */
  getLabels() {
    return this.getSpec().getLabels();
  }

  /**
   * @override
   */
  getServiceStatus() {
    switch (this.get('status')) {
      // DEGRADED - The number of STABLE pod instances is less than the number of desired instances.
      case 'DEGRADED':
        return ServiceStatus.RUNNING;
      // STABLE   - All launched pod instances have started and, if health checks were specified, are all healthy.
      case 'STABLE':
        return ServiceStatus.RUNNING;
      // TERMINAL - Marathon is tearing down all of the instances for this pod.
      case 'TERMINAL':
        return ServiceStatus.WAITING;

      default:
        return ServiceStatus.NA;
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
    return this.getInstances().length;
  }

  /**
   * @override
   */
  getTasksSummary() {
    let summary = this.getInstancesSummary();
    let containersDefined = this.getSpec().getContainerCount();

    summary.tasksRunning = this.getInstancesCount();
    summary.tasksOverCapacity = Math.max(
      0,
      summary.tasksRunning - containersDefined
    );

    return summary;
  }

  /**
   * @override
   */
  getResources() {
    return this.getSpec().getResourcesSummary();
  }

  getInstancesSummary() {
    let healthData = {
      tasksHealthy: 0,
      tasksStaged: 0,
      tasksUnhealthy: 0,
      tasksUnknown: 0
    };

    // Populate instance summary
    this.getInstances().forEach(function (instance) {
      let key = PODSTATUS_TO_HEALTH_MAP[instance.status];
      if (!key) key = 'tasksUnknown';
      healthData[key]++;
    });

    console.log(healthData);
    return healthData;
  }

  getInstances() {
    return this.get('instances') || [];
  }

};
