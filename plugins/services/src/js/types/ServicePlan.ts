import { ServicePlanResponse } from "#PLUGINS/services/src/js/data/ServicePlansClient";
import {
  ServicePlanPhase,
  ServicePlanPhasesResolver
} from "#PLUGINS/services/src/js/types/ServicePlanPhase";
import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";

export interface ServicePlan {
  name: string;
  phases: ServicePlanPhase[];
  status: ServicePlanStatus;
  errors: string[];
  strategy: string;
}

export const ServicePlanSchema = `
type ServicePlan {
  name: String!
  phases: [ServicePlanPhase!]!
  errors: [String!]!
  strategy: String!
  status: ServicePlanStatus!
}
`;

export function ServicePlanDetailResolver(
  response: ServicePlanResponse
): ServicePlan {
  return {
    name: response.name,
    phases: ServicePlanPhasesResolver(response.phases),
    errors: response.errors,
    strategy: response.strategy,
    status: response.status as ServicePlanStatus
  };
}
