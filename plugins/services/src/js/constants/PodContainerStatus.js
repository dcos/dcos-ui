const POD_CONTAINER_STATUS = {
  CREATED: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: "Created",
    healthStatus: "NA"
  },
  STAGING: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: "Staging",
    healthStatus: "NA"
  },
  STARTING: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: "Starting",
    healthStatus: "NA"
  },
  STARTED: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: "Started",
    healthStatus: "NA"
  },
  HEALTHY: {
    dotClassName: "dot healthy",
    textClassName: "task-status-running",
    displayName: "Running",
    healthStatus: "HEALTHY"
  },
  UNHEALTHY: {
    dotClassName: "dot unhealthy",
    textClassName: "task-status-running",
    displayName: "Unhealthy",
    healthStatus: "UNHEALTHY"
  },
  RUNNING: {
    dotClassName: "dot running",
    textClassName: "task-status-running",
    displayName: "Running",
    healthStatus: "NA"
  },
  ERROR: {
    dotClassName: "dot danger",
    textClassName: "task-status-error",
    displayName: "Error",
    healthStatus: "UNHEALTHY"
  },
  FAILED: {
    dotClassName: "dot danger",
    textClassName: "task-status-error",
    displayName: "Failed",
    healthStatus: "UNHEALTHY"
  },
  KILLING: {
    dotClassName: "dot danger",
    textClassName: "",
    displayName: "Killing",
    healthStatus: "UNHEALTHY"
  },
  KILLED: {
    dotClassName: "dot inactive danger",
    textClassName: "",
    displayName: "Killed",
    healthStatus: "NA"
  },
  FINISHED: {
    dotClassName: "dot inactive danger",
    textClassName: "",
    displayName: "Completed",
    healthStatus: "NA"
  },
  LOST: {
    dotClassName: "dot inactive danger",
    textClassName: "",
    displayName: "Lost",
    healthStatus: "NA"
  },
  NA: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: "N/A",
    healthStatus: "NA"
  }
};

module.exports = POD_CONTAINER_STATUS;
