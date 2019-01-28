import {
  ServicePlan,
  compare as comparePlans
} from "#PLUGINS/services/src/js/types/ServicePlan";

export interface Service {
  id: string;
  plans: ServicePlan[];
}

export const ServiceSchema = `
type Service {
  id: String!
  plans(name: String = ""): [ServicePlan]!
}
`;

export function compare(a: Service, b: Service): boolean {
  if (a.id !== b.id) {
    return false;
  }

  if (a.plans.length !== b.plans.length) {
    return false;
  }

  for (let i = 0; i < a.plans.length; i++) {
    if (!comparePlans(a.plans[i], b.plans[i])) {
      return false;
    }
  }

  return true;
}
