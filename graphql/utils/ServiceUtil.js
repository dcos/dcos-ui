import HealthStatus from '../../plugins/services/src/js/constants/HealthStatus';
import ServiceStatus from '../../plugins/services/src/js/constants/ServiceStatus';

const ServiceUtil = {

  getHealth(service) {
    const {
      tasksHealthy,
      tasksUnhealthy,
      tasksRunning
    } = this.getTasksSummary(service);

    if (tasksUnhealthy > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (tasksRunning > 0 && tasksHealthy === tasksRunning) {
      return HealthStatus.HEALTHY;
    }

    if (service.healthChecks && tasksRunning === 0) {
      return HealthStatus.IDLE;
    }

    return HealthStatus.NA;
  },

  getStatus(service) {
    const status = this.getServiceStatus(service);

    if (status.displayName == null) {
      return null;
    }

    return status.displayName;
  },

  getServiceStatus(service) {
    const {
      deployments = [],
      instances = 0,
      tasksRunning,
      queue = {}
    } = service;

    if (instances === 0 && tasksRunning === 0) {
      return ServiceStatus.SUSPENDED;
    }

    if (queue.delay) {
      if (queue.delay.overdue) {
        return ServiceStatus.WAITING;
      }

      return ServiceStatus.DELAYED;
    }

    if (deployments.length > 0) {
      return ServiceStatus.DEPLOYING;
    }

    if (tasksRunning > 0) {
      return ServiceStatus.RUNNING;
    }

    return ServiceStatus.NA;
  },

  getTasksSummary(service) {
    const {
      instances = 0,
      tasksHealthy = 0,
      tasksStaged = 0,
      tasksRunning = 0,
      tasksUnhealthy = 0
    } = service;

    const tasksUnknown = Math.max(
      0,
      tasksRunning - tasksHealthy - tasksUnhealthy
    );

    const tasksSum = (
      tasksHealthy +
      tasksStaged +
      tasksUnhealthy +
      tasksUnknown
    );

    const tasksOverCapacity = Math.max(0, tasksSum - instances);

    return {
      healthy: tasksHealthy,
      overCapacity: tasksOverCapacity,
      running: tasksRunning,
      staged: tasksStaged,
      unhealthy: tasksUnhealthy,
      unknown: tasksUnknown
    };
  }
};

export default ServiceUtil;
