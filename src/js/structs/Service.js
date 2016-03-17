import HealthStatus from '../constants/HealthStatus';
import Item from './Item';

module.exports = class Service extends Item {
  get arguments() {
    return this.get('args');
  }

  get command() {
    return this.get('cmd');
  }

  get container() {
    return this.get('container');
  }

  get executer() {
    return this.get('executor');
  }

  get health() {
    if (this.healthChecks == null || this.healthChecks.length === 0) {
      return HealthStatus.NA;
    }

    let health = HealthStatus.IDLE;
    let {tasksHealthy, tasksRunning} = this.tasksSummary;

    if (tasksHealthy > 0) {
      health = HealthStatus.UNHEALTHY;
    } else if (tasksRunning > 0 && tasksHealthy === tasksRunning) {
      health = HealthStatus.HEALTHY;
    }

    return health;
  }

  get healthChecks() {
    return this.get('healthChecks');
  }

  get id() {
    return this.get('id');
  }

  get instances() {
    return this.get('instances');
  }

  get labels() {
    return this.get('labels');
  }

  get lastConfigChange() {
    return this.versionInfo.lastConfigChangeAt;
  }

  get lastScaled() {
    return this.versionInfo.lastScalingAt;
  }

  get name() {
    return this.id.split('/').pop();
  }

  get ports() {
    return this.get('ports');
  }

  get resources() {
    return {
      cpus: this.get('cpus'),
      mem: this.get('mem'),
      disk: this.get('disk')
    };
  }

  get tasksSummary() {
    return {
      tasksHealthy: this.get('tasksHealthy'),
      tasksRunning: this.get('tasksRunning'),
      tasksStaged: this.get('tasksStaged'),
      tasksUnhealthy: this.get('tasksUnhealthy')
    };
  }

  get uris() {
    return this.get('uris');
  }

  get user() {
    return this.get('user');
  }

  get versionInfo() {
    return this.get('versionInfo');
  }
};
