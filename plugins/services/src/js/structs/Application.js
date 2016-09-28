import ApplicationSpec from './ApplicationSpec';
import Config from '../../../../../src/js/config/Config';
import FrameworkUtil from '../utils/FrameworkUtil';
import HealthStatus from '../constants/HealthStatus';
import Service from './Service';
import ServiceStatus from '../constants/ServiceStatus';
import TaskStats from './TaskStats';
import VolumeList from './VolumeList';

module.exports = class Application extends Service {
  getDeployments() {
    return this.get('deployments');
  }

  /**
   * @override
   */
  getSpec() {
    return new ApplicationSpec(this.get());
  }

  /**
   * @override
   */
  getHealth() {
    let {tasksHealthy, tasksUnhealthy, tasksRunning} = this.getTasksSummary();
    let healthChecks = this.getSpec().getHealthChecks();

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
    return this.get('instances') || 0;
  }

  /**
   * @override
   */
  getLabels() {
    return this.getSpec().getLabels();
  }

  getLastConfigChange() {
    return this.getVersionInfo().lastConfigChangeAt;
  }

  getLastScaled() {
    return this.getVersionInfo().lastScalingAt;
  }

  getLastTaskFailure() {
    return this.get('lastTaskFailure');
  }

  getMetadata() {
    return FrameworkUtil.getMetadataFromLabels(this.getLabels());
  }

  getName() {
    return this.getId().split('/').pop();
  }

  getPorts() {
    return this.get('ports');
  }

  /**
   * @override
   */
  getResources() {
    return {
      cpus: this.get('cpus'),
      mem: this.get('mem'),
      disk: this.get('disk')
    };
  }

  getResidency() {
    return this.get('residency');
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
    let {tasksRunning} = this.getTasksSummary();
    let deployments = this.getDeployments();
    let queue = this.getQueue();

    let instances = this.getInstancesCount();
    if (instances === 0 &&
      tasksRunning === 0
    ) {
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
    let healthData = {
      tasksHealthy: this.get('tasksHealthy'),
      tasksStaged: this.get('tasksStaged'),
      tasksUnhealthy: this.get('tasksUnhealthy'),
      tasksUnknown: Math.max(0, this.get('tasksRunning') -
        this.get('tasksHealthy') - this.get('tasksUnhealthy'))
    };

    let tasksSum = Object.keys(healthData).reduce(function (sum, healthItem) {
      return sum + healthData[healthItem];
    }, 0);

    healthData.tasksOverCapacity =
      Math.max(0, tasksSum - this.getInstancesCount());

    healthData.tasksRunning = this.get('tasksRunning');
    return healthData;
  }

  getTaskStats() {
    return new TaskStats(this.get('taskStats'));
  }

  getQueue() {
    return this.get('queue');
  }

  getVersion() {
    return this.get('version');
  }

  getVersions() {
    return this.get('versions') || new Map();
  }

  getVersionInfo() {
    let currentVersionID = this.get('version');
    let {lastConfigChangeAt, lastScalingAt} = this.get('versionInfo');

    return {lastConfigChangeAt, lastScalingAt, currentVersionID};
  }

  /**
   * @override
   */
  getVolumes() {
    return new VolumeList({items: this.get('volumes') || []});
  }

  /**
   * @override
   */
  getWebURL() {
    let {
      DCOS_SERVICE_NAME,
      DCOS_SERVICE_PORT_INDEX,
      DCOS_SERVICE_SCHEME
    } = this.getLabels() || {};

    let serviceName = encodeURIComponent(DCOS_SERVICE_NAME);

    if (!serviceName || !DCOS_SERVICE_PORT_INDEX || !DCOS_SERVICE_SCHEME) {
      return null;
    }

    return `${Config.rootUrl}/service/${serviceName}/`;

  }

};
