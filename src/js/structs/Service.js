import Config from '../config/Config';
import HealthStatus from '../constants/HealthStatus';
import Item from './Item';
import ServiceImages from '../constants/ServiceImages';
import ServiceStatus from '../constants/ServiceStatus';
import TaskStats from './TaskStats';
import VolumeList from './VolumeList';

function renamePortDefinition(fromName, toName, portDef) {
  if (portDef.labels) {
    Object.keys(portDef.labels).forEach(function (labelName) {
      if (labelName.substr(0, 4) === 'VIP_') {
        let labelValue = portDef.labels[labelName];
        let labelParts = labelValue.split(':');
        if (labelParts[0] === fromName) {
          portDef.labels[labelName] = toName + ':' + labelParts[1];
          return;
        }
      }
    });
  }
}

module.exports = class Service extends Item {
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

  getAcceptedResourceRoles() {
    return this.get('acceptedResourceRoles');
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

  getId() {
    return this.get('id') || '';
  }

  getImages() {
    return this.get('images') || ServiceImages.NA_IMAGES;
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

  getName() {
    return this.getId().split('/').pop();
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

  getStatus() {
    const status = this.getServiceStatus();
    if (status.displayName == null) {
      return null;
    }

    return status.displayName;
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

  handleRename(fromName, toName) {

    // Rename VIPs on portDefinitions
    let portDefinitions = this.getPortDefinitions();
    portDefinitions.forEach(renamePortDefinition.bind(this, fromName, toName));

    // Rename VIPs on portMappings in a docker container
    let container = this.getContainer();
    if (container.docker && container.docker.portMappings) {
      container.docker.portMappings.forEach(renamePortDefinition.bind(this, fromName, toName));
    }

  }

  toJSON() {
    return JSON.stringify(this.get());
  }
};
