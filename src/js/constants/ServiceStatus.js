import StatusLabels from './StatusLabels';
import StatusTypes from './StatusTypes';

var SERVICE_STATUS = {
  RUNNING: {
    key: StatusTypes.RUNNING,
    displayName: StatusLabels.RUNNING
  },
  DEPLOYING: {
    key: StatusTypes.DEPLOYING,
    displayName: StatusLabels.DEPLOYING
  },
  SUSPENDED: {
    key: StatusTypes.SUSPENDED,
    displayName: StatusLabels.SUSPENDED
  }
};

module.exports = SERVICE_STATUS;
