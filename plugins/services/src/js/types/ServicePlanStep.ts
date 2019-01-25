import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";

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
