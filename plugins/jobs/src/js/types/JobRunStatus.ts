export type JobRunStatus = "Failed" | "N/A" | "Success";

export const JobRunStatusSchema = `
enum JobRunStatus {
  Failed
  "N/A"
  Success
}
`;
