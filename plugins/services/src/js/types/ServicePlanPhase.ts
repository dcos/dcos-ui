import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlanStep } from "#PLUGINS/services/src/js/types/ServicePlanStep";

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
