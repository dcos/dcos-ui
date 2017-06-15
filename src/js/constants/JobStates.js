const JobStates = {
  INITIAL: {
    stateTypes: ["active"],
    displayName: "Starting"
  },
  STARTING: {
    stateTypes: ["active"],
    displayName: "Starting"
  },
  ACTIVE: {
    stateTypes: ["active"],
    displayName: "Running"
  },
  FAILED: {
    stateTypes: ["completed", "failure"],
    displayName: "Failed"
  },
  SUCCESS: {
    stateTypes: ["success"],
    displayName: "Success"
  },
  COMPLETED: {
    stateTypes: ["success"],
    displayName: "Completed"
  },
  SCHEDULED: {
    stateTypes: [],
    displayName: "Scheduled"
  },
  UNSCHEDULED: {
    stateTypes: [],
    displayName: "Unscheduled"
  }
};

module.exports = JobStates;
