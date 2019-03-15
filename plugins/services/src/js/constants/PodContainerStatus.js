import { i18nMark } from "@lingui/react";

const POD_CONTAINER_STATUS = {
  CREATED: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: i18nMark("Created"),
    healthStatus: "NA"
  },
  STAGING: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: i18nMark("Staging"),
    healthStatus: "NA"
  },
  STARTING: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: i18nMark("Starting"),
    healthStatus: "NA"
  },
  STARTED: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: i18nMark("Started"),
    healthStatus: "NA"
  },
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
  ERROR: {
    dotClassName: "dot danger",
    textClassName: "task-status-error",
    displayName: i18nMark("Error"),
    healthStatus: "UNHEALTHY"
  },
  FAILED: {
    dotClassName: "dot danger",
    textClassName: "task-status-error",
    displayName: i18nMark("Failed"),
    healthStatus: "UNHEALTHY"
  },
  KILLING: {
    dotClassName: "dot danger",
    textClassName: "",
    displayName: i18nMark("Killing"),
    healthStatus: "UNHEALTHY"
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
  LOST: {
    dotClassName: "dot inactive danger",
    textClassName: "",
    displayName: i18nMark("Lost"),
    healthStatus: "NA"
  },
  NA: {
    dotClassName: "dot inactive unknown",
    textClassName: "",
    displayName: i18nMark("N/A"),
    healthStatus: "NA"
  }
};

export default POD_CONTAINER_STATUS;
