import HealthStatus from '../constants/HealthStatus';
import Item from './Item';
import ServiceImages from '../constants/ServiceImages';

module.exports = class Service extends Item {
  getArguments() {
    return this.get('args');
  }

  getCommand() {
    return this.get('cmd');
  }

  getContainer() {
    return this.get('container');
  }

  getExecutor() {
    return this.get('executor');
  }

  getHealth() {
    if (this.getHealthChecks() == null || this.getHealthChecks().length === 0) {
      return HealthStatus.NA;
    }

    let health = HealthStatus.IDLE;
    let {tasksHealthy, taskUnhealthy, tasksRunning} = this.getTasksSummary();

    if (taskUnhealthy > 0) {
      health = HealthStatus.UNHEALTHY;
    } else if (tasksRunning > 0 && tasksHealthy === tasksRunning) {
      health = HealthStatus.HEALTHY;
    }

    return health;
  }

  getHealthChecks() {
    return this.get('healthChecks');
  }

  getId() {
    return this.get('id');
  }

  getImages() {
    return this.get('images') || ServiceImages.NA_IMAGES;
  }

  getInstances() {
    return this.get('instances');
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

  getName() {
    return this.getId().split('/').pop();
  }

  getPorts() {
    return this.get('ports');
  }

  getResources() {
    return {
      cpus: this.get('cpus'),
      mem: this.get('mem'),
      disk: this.get('disk')
    };
  }

  getTasksSummary() {
    return {
      tasksHealthy: this.get('tasksHealthy'),
      tasksRunning: this.get('tasksRunning'),
      tasksStaged: this.get('tasksStaged'),
      tasksUnhealthy: this.get('tasksUnhealthy')
    };
  }

  getFetch() {
    return this.get('fetch');
  }

  getUser() {
    return this.get('user');
  }

  getVersionInfo() {
    return this.get('versionInfo');
  }
};
