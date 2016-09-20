import Item from './Item';
import PodContainer from './PodContainer';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import StringUtil from '../utils/StringUtil';

module.exports = class PodInstance extends Item {
  getAgentAddress() {
    return this.get('agent') || '';
  }

  getContainers() {
    let containers = this.get('containers') || [];
    return containers.map((container) => {
      return new PodContainer(container);
    });
  }

  getId() {
    return this.get('id') || '';
  }

  getName() {
    return this.getId();
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

  getLastChanged() {
    return new Date(this.get('lastChanged'));
  }

  getLastUpdated() {
    return new Date(this.get('lastUpdated'));
  }

  hasHealthChecks() {
    // If for any reason any of the containers has at least 1 health
    // check that is failing, assume that we have leath checks
    if (!this.isHealthy()) {
      return true;
    }

    // If we have no containers, return false
    let containers = this.getContainers();
    if (!containers.length) {
      return false;
    }

    // Otherwise ALL container must have health checks in order to be
    // considered healthy.
    return containers.every(function (container) {
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
