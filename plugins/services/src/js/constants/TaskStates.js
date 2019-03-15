import { i18nMark } from "@lingui/react";

const TaskStates = {
  TASK_CREATED: {
    stateTypes: ["active", "success"],
    displayName: i18nMark("Created")
  },

  TASK_STAGING: {
    stateTypes: ["active", "success"],
    displayName: i18nMark("Staging")
  },

  TASK_STARTING: {
    stateTypes: ["active", "success"],
    displayName: i18nMark("Starting")
  },

  TASK_STARTED: {
    stateTypes: ["active", "success"],
    displayName: i18nMark("Started")
  },

  TASK_RUNNING: {
    stateTypes: ["active", "success"],
    displayName: i18nMark("Running")
  },

  TASK_KILLING: {
    stateTypes: ["active", "failure"],
    displayName: i18nMark("Killing")
  },

  TASK_FINISHED: {
    stateTypes: ["completed", "success"],
    displayName: i18nMark("Finished")
  },

  TASK_KILLED: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Killed")
  },

  TASK_FAILED: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Failed")
  },

  TASK_LOST: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Lost")
  },

  TASK_ERROR: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Error")
  },

  TASK_GONE: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Gone")
  },

  TASK_GONE_BY_OPERATOR: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Gone by operator")
  },

  TASK_DROPPED: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Dropped")
  },

  TASK_UNREACHABLE: {
    stateTypes: ["active", "failure"],
    displayName: i18nMark("Unreachable")
  },

  TASK_UNKNOWN: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Unknown")
  }
};

export default TaskStates;
