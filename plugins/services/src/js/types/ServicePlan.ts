import { ServicePlanPhase } from "#PLUGINS/services/src/js/types/ServicePlanPhase";
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
