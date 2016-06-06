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
  }
};

module.exports = SERVICE_STATUS;
