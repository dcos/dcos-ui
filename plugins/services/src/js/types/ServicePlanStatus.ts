import { i18nMark } from "@lingui/react";

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

export function formatServicePlanStatus(status: ServicePlanStatus): string {
  switch (status) {
    case "ERROR":
      return i18nMark("Error");
    case "WAITING":
      return i18nMark("Waiting");
    case "PENDING":
      return i18nMark("Pending");
    case "PREPARED":
      return i18nMark("Prepared");
    case "STARTING":
      return i18nMark("Starting");
    case "STARTED":
      return i18nMark("Started");
    case "COMPLETE":
      return i18nMark("Complete");
    case "IN_PROGRESS":
      return i18nMark("In Progress");
  }
}
