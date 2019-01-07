import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlanPhaseResponse } from "#PLUGINS/services/src/js/data/ServicePlansClient";
import {
  ServicePlanStep,
  ServicePlanStepsResolver
} from "#PLUGINS/services/src/js/types/ServicePlanStep";

export interface ServicePlanPhase {
  id: string;
  name: string;
  steps: ServicePlanStep[];
  strategy: string;
  status: ServicePlanStatus;
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

export function ServicePlanPhasesResolver(
  phases: ServicePlanPhaseResponse[]
): ServicePlanPhase[] {
  return phases.map(ServicePlanPhaseResolver);
}

export function ServicePlanPhaseResolver(
  phase: ServicePlanPhaseResponse
): ServicePlanPhase {
  return {
    id: phase.id,
    name: phase.name,
    steps: ServicePlanStepsResolver(phase.steps),
    strategy: phase.strategy,
    status: phase.status as ServicePlanStatus
  };
}
