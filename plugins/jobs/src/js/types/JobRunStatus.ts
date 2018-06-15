export type JobRunStatus = "Failed" | "N/A" | "Success";

export const JobRunStatusSchema = `
enum JobRunStatus {
  Failed
  "N/A"
  Success
}
`;

export interface JobRunStatusMap {
  [state: string]: {
    displayName: string;
    sortOrder: number;
  };
}

const statusMap: JobRunStatusMap = {
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

export default statusMap;
