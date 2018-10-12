/**
 * Sort order is ordered by most important (lowest number, top of list)
 * to least important (largest number, bottom of list)
 */

import { i18nMark } from "@lingui/react";

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
    displayName: i18nMark("Starting"),
    sortOrder: 3
  },
  STARTING: {
    stateTypes: ["active"],
    displayName: i18nMark("Starting"),
    sortOrder: 3
  },
  ACTIVE: {
    stateTypes: ["active"],
    displayName: i18nMark("Running"),
    sortOrder: 4
  },
  FAILED: {
    stateTypes: ["completed", "failure"],
    displayName: i18nMark("Failed"),
    sortOrder: 0
  },
  SUCCESS: {
    stateTypes: ["success"],
    displayName: i18nMark("Success"),
    sortOrder: 6
  },
  COMPLETED: {
    stateTypes: ["success"],
    displayName: i18nMark("Completed"),
    sortOrder: 5
  },
  SCHEDULED: {
    stateTypes: [],
    displayName: i18nMark("Scheduled"),
    sortOrder: 2
  },
  UNSCHEDULED: {
    stateTypes: [],
    displayName: i18nMark("Unscheduled"),
    sortOrder: 1
  }
};

export default states;
