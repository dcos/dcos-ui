import { ServicePlan } from "#PLUGINS/services/src/js/types/ServicePlan";

export interface Service {
  name: string;
  plans: ServicePlan[];
}

export const ServiceSchema = `
type Service {
  name: String!
  plans(name: String = ""): [ServicePlan]!
}
`;
