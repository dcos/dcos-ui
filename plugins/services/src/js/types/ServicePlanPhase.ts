import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import {
  ServicePlanStep,
  compare as compareSteps
} from "#PLUGINS/services/src/js/types/ServicePlanStep";

export interface ServicePlanPhase {
  id: string;
  name: string;
  steps: ServicePlanStep[];
  strategy: string;
  status: ServicePlanStatus;
}

export function compare(a: ServicePlanPhase, b: ServicePlanPhase): boolean {
  if (
    a.id !== b.id ||
    a.name !== b.name ||
    a.status !== b.status ||
    a.strategy !== b.strategy ||
    a.steps.length !== b.steps.length
  ) {
    return false;
  }
  for (let i = 0; i < a.steps.length; i++) {
    if (!compareSteps(a.steps[i], b.steps[i])) {
      return false;
    }
  }

  return true;
}

export const ServicePlanPhaseSchema = `
type ServicePlanPhase {
  id: String!
  name: String!
  steps: [ServicePlanStep!]!
  strategy: String!
  status: ServicePlanStatus!
}
`;
