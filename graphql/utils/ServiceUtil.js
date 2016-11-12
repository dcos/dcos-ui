import HealthStatus from '../../plugins/services/src/js/constants/HealthStatus';
import ServiceStatus from '../../plugins/services/src/js/constants/ServiceStatus';

const ServiceUtil = {

  getHealth(service) {
    const {
      healthy,
      unhealthy,
      running
    } = this.getTasksSummary(service);

    if (unhealthy > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (running > 0 && healthy === running) {
      return HealthStatus.HEALTHY;
    }

    if (service.healthChecks && running === 0) {
      return HealthStatus.IDLE;
    }

    return HealthStatus.NA;
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
