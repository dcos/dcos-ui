import ServiceStatusLabels from './ServiceStatusLabels';
import ServiceStatusTypes from './ServiceStatusTypes';

var SERVICE_STATUS = {
  RUNNING: {
    key: ServiceStatusTypes.RUNNING,
    displayName: ServiceStatusLabels.RUNNING
  },
  DEPLOYING: {
    key: ServiceStatusTypes.DEPLOYING,
    displayName: ServiceStatusLabels.DEPLOYING
  },
  SUSPENDED: {
    key: ServiceStatusTypes.SUSPENDED,
    displayName: ServiceStatusLabels.SUSPENDED
  },
  NA: {
    key: ServiceStatusTypes.NA,
    displayName: ServiceStatusLabels.NA
  },
  DELAYED: {
    key: ServiceStatusTypes.DELAYED,
    displayName: ServiceStatusLabels.DELAYED
  },
  WAITING: {
    key: ServiceStatusTypes.WAITING,
    displayName: ServiceStatusLabels.WAITING
  }
};

module.exports = SERVICE_STATUS;
