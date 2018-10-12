/**
 * Sort order is ordered by most important (lowest number, top of list)
 * to least important (largest number, bottom of list)
 */
export interface JobStatus {
  [state: string]: {
    sortOrder: number;
  };
}

const status: JobStatus = {
  "N/A": {
    sortOrder: 1
  },
  Success: {
    sortOrder: 2
  },
  Failed: {
    sortOrder: 0
  }
};

export default status;
