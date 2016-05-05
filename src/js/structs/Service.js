import HealthStatus from '../constants/HealthStatus';
import Item from './Item';
import ServiceImages from '../constants/ServiceImages';
import ServiceStatus from '../constants/ServiceStatus';

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

  getDeployments() {
    return this.get('deployments');
  }

  getExecutor() {
    return this.get('executor');
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

  getStatus() {
    let {tasksRunning} = this.getTasksSummary();
    let deployments = this.getDeployments();

    if (deployments.length > 0) {
      return ServiceStatus.DEPLOYING.displayName;
    }

    if (tasksRunning > 0) {
      return ServiceStatus.RUNNING.displayName;
    }

    let instances = this.getInstancesCount();
    if (instances === 0) {
      return ServiceStatus.SUSPENDED.displayName;
    }
  }

  getTasksSummary() {
    return {
      tasksHealthy: this.get('tasksHealthy'),
      tasksRunning: this.get('tasksRunning'),
      tasksStaged: this.get('tasksStaged'),
      tasksUnhealthy: this.get('tasksUnhealthy'),
      tasksUnknown: this.get('tasksRunning') -
        this.get('tasksHealthy') - this.get('tasksUnhealthy'),
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
