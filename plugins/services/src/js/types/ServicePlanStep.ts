import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlanStepResponse } from "#PLUGINS/services/src/js/data/ServicePlansClient";

export interface ServicePlanStep {
  id: string;
  name: string;
  status: ServicePlanStatus;
  message: string;
}

export const ServicePlanStepSchema = `
type ServicePlanStep {
  id: String!
  name: String!
  status: ServicePlanStatus!
  message: String!
}
`;

export function ServicePlanStepsResolver(
  steps: ServicePlanStepResponse[]
): ServicePlanStep[] {
  return steps.map(step => ({
    id: step.id,
    name: step.name,
    status: step.status as ServicePlanStatus,
    message: step.message
  }));
}
