import ServiceStatusLabels from "./ServiceStatusLabels";
import ServiceStatusTypes from "./ServiceStatusTypes";

interface ServiceStatusType {
  key: number;
  displayName: string;
}

interface ServiceStatusInterface {
  RUNNING: ServiceStatusType;
  DEPLOYING: ServiceStatusType;
  STOPPED: ServiceStatusType;
  NA: ServiceStatusType;
  DELAYED: ServiceStatusType;
  WAITING: ServiceStatusType;
  DELETING: ServiceStatusType;
  RECOVERING: ServiceStatusType;
}

var ServiceStatus: ServiceStatusInterface = {
  RUNNING: {
    key: ServiceStatusTypes.RUNNING,
    displayName: ServiceStatusLabels.RUNNING
  },
  DEPLOYING: {
    key: ServiceStatusTypes.DEPLOYING,
    displayName: ServiceStatusLabels.DEPLOYING
  },
  STOPPED: {
    key: ServiceStatusTypes.STOPPED,
    displayName: ServiceStatusLabels.STOPPED
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
  },
  DELETING: {
    key: ServiceStatusTypes.DELETING,
    displayName: ServiceStatusLabels.DELETING
  },
  RECOVERING: {
    key: ServiceStatusTypes.RECOVERING,
    displayName: ServiceStatusLabels.RECOVERING
  }
};

module.exports = ServiceStatus;
export default ServiceStatus;
