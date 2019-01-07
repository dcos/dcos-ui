export type ServicePlanStatus =
  | "ERROR"
  | "WAITING"
  | "PENDING"
  | "PREPARED"
  | "STARTING"
  | "STARTED"
  | "COMPLETE"
  | "IN_PROGRESS";

export const ServicePlanStatusSchema = `
enum ServicePlanStatus {
  ERROR
  WAITING
  PENDING
  PREPARED
  STARTING
  STARTED
  COMPLETE
  IN_PROGRESS
}
`;
