const POD_INSTANCE_STATUS = {
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
  STAGED: {
    dotClassName: "dot staged",
    textClassName: "task-status-staging",
    displayName: "Staging",
    healthStatus: "NA"
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
  NA: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: "N/A",
    healthStatus: "NA"
  }
};

module.exports = POD_INSTANCE_STATUS;
