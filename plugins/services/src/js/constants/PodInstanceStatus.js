import { i18nMark } from "@lingui/react";

const POD_INSTANCE_STATUS = {
  HEALTHY: {
    dotClassName: "dot healthy",
    textClassName: "task-status-running",
    displayName: i18nMark("Running"),
    healthStatus: "HEALTHY"
  },
  UNHEALTHY: {
    dotClassName: "dot unhealthy",
    textClassName: "task-status-running",
    displayName: i18nMark("Unhealthy"),
    healthStatus: "UNHEALTHY"
  },
  RUNNING: {
    dotClassName: "dot running",
    textClassName: "task-status-running",
    displayName: i18nMark("Running"),
    healthStatus: "NA"
  },
  STAGED: {
    dotClassName: "dot staged",
    textClassName: "task-status-staging",
    displayName: i18nMark("Staging"),
    healthStatus: "NA"
  },
  KILLED: {
    dotClassName: "dot inactive danger",
    textClassName: "",
    displayName: i18nMark("Killed"),
    healthStatus: "NA"
  },
  FINISHED: {
    dotClassName: "dot inactive danger",
    textClassName: "",
    displayName: i18nMark("Completed"),
    healthStatus: "NA"
  },
  NA: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: i18nMark("N/A"),
    healthStatus: "NA"
  }
};

module.exports = POD_INSTANCE_STATUS;
