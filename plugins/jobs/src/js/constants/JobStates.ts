/**
 * Sort order is ordered by most important (lowest number, top of list)
 * to least important (largest number, bottom of list)
 */

export interface JobStates {
  [state: string]: {
    stateTypes: string[];
    displayName: string;
    sortOrder: number;
  };
}

const states: JobStates = {
  INITIAL: {
    stateTypes: ["active"],
    displayName: "Starting",
    sortOrder: 3
  },
  STARTING: {
    stateTypes: ["active"],
    displayName: "Starting",
    sortOrder: 3
  },
  ACTIVE: {
    stateTypes: ["active"],
    displayName: "Running",
    sortOrder: 4
  },
  FAILED: {
    stateTypes: ["completed", "failure"],
    displayName: "Failed",
    sortOrder: 0
  },
  SUCCESS: {
    stateTypes: ["success"],
    displayName: "Success",
    sortOrder: 6
  },
  COMPLETED: {
    stateTypes: ["success"],
    displayName: "Completed",
    sortOrder: 5
  },
  SCHEDULED: {
    stateTypes: [],
    displayName: "Scheduled",
    sortOrder: 2
  },
  UNSCHEDULED: {
    stateTypes: [],
    displayName: "Unscheduled",
    sortOrder: 1
  }
};

export default states;
