import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";

export interface ServicePlanStep {
  id: string;
  name: string;
  status: ServicePlanStatus;
  message: string;
}

export function compare(a: ServicePlanStep, b: ServicePlanStep): boolean {
  return !(
    a.id !== b.id ||
    a.name !== b.name ||
    a.status !== b.status ||
    a.message !== b.message
  );
}

export const ServicePlanStepSchema = `
type ServicePlanStep {
  id: String!
  name: String!
  status: ServicePlanStatus!
  message: String!
}
`;
