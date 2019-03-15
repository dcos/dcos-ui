import ServiceStatusLabels from "./ServiceStatusLabels";
import ServiceStatusTypes from "./ServiceStatusTypes";

const SERVICE_STATUS = {
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

export default SERVICE_STATUS;
