const TaskStates = {
  TASK_CREATED: {
    stateTypes: ["active", "success"],
    displayName: "Created"
  },

  TASK_STAGING: {
    stateTypes: ["active", "success"],
    displayName: "Staging"
  },

  TASK_STARTING: {
    stateTypes: ["active", "success"],
    displayName: "Starting"
  },

  TASK_STARTED: {
    stateTypes: ["active", "success"],
    displayName: "Started"
  },

  TASK_RUNNING: {
    stateTypes: ["active", "success"],
    displayName: "Running"
  },

  TASK_KILLING: {
    stateTypes: ["active", "failure"],
    displayName: "Killing"
  },

  TASK_FINISHED: {
    stateTypes: ["completed", "success"],
    displayName: "Finished"
  },

  TASK_KILLED: {
    stateTypes: ["completed", "failure"],
    displayName: "Killed"
  },

  TASK_FAILED: {
    stateTypes: ["completed", "failure"],
    displayName: "Failed"
  },

  TASK_LOST: {
    stateTypes: ["completed", "failure"],
    displayName: "Lost"
  },

  TASK_ERROR: {
    stateTypes: ["completed", "failure"],
    displayName: "Error"
  },

  TASK_GONE: {
    stateTypes: ["completed", "failure"],
    displayName: "Gone"
  },

  TASK_GONE_BY_OPERATOR: {
    stateTypes: ["completed", "failure"],
    displayName: "Gone by operator"
  },

  TASK_DROPPED: {
    stateTypes: ["completed", "failure"],
    displayName: "Dropped"
  },

  TASK_UNREACHABLE: {
    stateTypes: ["completed", "failure"],
    displayName: "Unreachable"
  },

  TASK_UNKNOWN: {
    stateTypes: ["completed", "failure"],
    displayName: "Unknown"
  }
};

module.exports = TaskStates;
