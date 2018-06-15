export type JobStatus =
  | "ACTIVE"
  | "FAILED"
  | "INITIAL"
  | "RUNNING"
  | "STARTING"
  | "COMPLETED"
  | "SCHEDULED"
  | "UNSCHEDULED";

export const JobStatusSchema = `
enum JobStatus {
  ACTIVE
  COMPLETED
  FAILED
  INITIAL
  RUNNING
  SCHEDULED
  STARTING
  UNSCHEDULED
}
`;
