import Config from '../config/Config';
import FrameworkUtil from '../utils/FrameworkUtil';
import HealthStatus from '../constants/HealthStatus';
import Service from './Service';
import ServiceStatus from '../constants/ServiceStatus';
import TaskStats from './TaskStats';
import VolumeList from './VolumeList';

module.exports = class Application extends Service {
  getAcceptedResourceRoles() {
    return this.get('acceptedResourceRoles');
  }

  getArguments() {
    return this.get('args');
  }

  getCommand() {
    return this.get('cmd');
  }

  getContainerSettings() {
    return this.get('container');
  }

  getCpus() {
    return this.get('cpus');
  }

  getContainer() {
    return this.get('container');
  }

  getConstraints() {
    return this.get('constraints');
  }

  getDeployments() {
    return this.get('deployments');
  }

  getDisk() {
    return this.get('disk');
  }

  getEnvironmentVariables() {
    return this.get('env');
  }

  getExecutor() {
    return this.get('executor');
  }

  getSpec() {
    // DCOS-9613: This should be properly implemented
    return this;
  }

  getHealth() {
    let {tasksHealthy, tasksUnhealthy, tasksRunning} = this.getTasksSummary();

    if (tasksUnhealthy > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (tasksRunning > 0 && tasksHealthy === tasksRunning) {
      return HealthStatus.HEALTHY;
    }

    if (this.getHealthChecks() && tasksRunning === 0) {
      return HealthStatus.IDLE;
    }

    return HealthStatus.NA;
  }

  getHealthChecks() {
    return this.get('healthChecks');
  }

  getImages() {
    return FrameworkUtil.getServiceImages(this.getMetadata().images);
  }

  getInstancesCount() {
    return this.get('instances');
  }

  getIpAddress() {
    return this.get('ipAddress');
  }

  getLabels() {
    return this.get('labels');
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

  getMem() {
    return this.get('mem');
  }

  getMetadata() {
    return FrameworkUtil.getMetadataFromLabels(this.getLabels());
  }

  getPorts() {
    return this.get('ports');
  }

  getPortDefinitions() {
    return this.get('portDefinitions');
  }

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

  getFetch() {
    return this.get('fetch');
  }

  getQueue() {
    return this.get('queue');
  }

  getUpdateStrategy() {
    return this.get('updateStrategy');
  }

  getUser() {
    return this.get('user');
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

  getVolumes() {
    return new VolumeList({items: this.get('volumes') || []});
  }

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
