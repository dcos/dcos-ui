/**
 * Sort order is ordered by most important (lowest number, top of list)
 * to least important (largest number, bottom of list)
 */
interface IJobStatus {
  [key: string]: {
    displayName: string;
    sortOrder: number;
  };
}

const status: IJobStatus = {
  "N/A": {
    displayName: "N/A",
    sortOrder: 1
  },
  Success: {
    displayName: "Success",
    sortOrder: 2
  },
  Failed: {
    displayName: "Failed",
    sortOrder: 0
  }
};

export default status;
