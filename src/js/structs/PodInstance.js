import Item from './Item';
import PodContainer from './PodContainer';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import StringUtil from '../utils/StringUtil';

module.exports = class PodInstance extends Item {

  getContainers() {
    let containers = this.get('containers') || [];
    return containers.map((container) => {
      return new PodContainer(container);
    });
  }

  getInstanceStatus() {
    switch (this.get('status')) {
      case 'PENDING':
        return PodInstanceStatus.STAGED;

      case 'STAGING':
        return PodInstanceStatus.STAGED;

      case 'STABLE':
        if (this.hasHealthChecks()) {
          if (this.isHealthy()) {
            return PodInstanceStatus.HEALTHY;
          } else {
            return PodInstanceStatus.UNHEALTHY;
          }
        } else {
          return PodInstanceStatus.RUNNING;
        }

      case 'DEGRADED':
        return PodInstanceStatus.UNHEALTHY;

      case 'TERMINAL':
        return PodInstanceStatus.KILLED;

      default:
        return Object.assign(Object.create(PodInstanceStatus.NA), {
          displayName: StringUtil.capitalize(this.get('status').toLowerCase())
        });
    }
  }

  hasHealthChecks() {
    return this.getContainers().some(function (container) {
      return container.hasHealthChecks();
    });
  }

  isHealthy() {
    if (this.get('status') !== 'STABLE') {
      return false;
    }
    return this.getContainers().every(function (container) {
      return container.isHealthy();
    });
  }

  isRunning() {
    let status = this.get('status');
    return (status === 'STABLE') || (status === 'DEGRADED');
  }

  isStaging() {
    let status = this.get('status');
    return (status === 'PENDING') || (status === 'STAGING');
  }

  isTerminating() {
    return this.get('status') === 'TERMINAL';
  }
};
