import {
  ServicePlan,
  compare as comparePlans
} from "#PLUGINS/services/src/js/types/ServicePlan";

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

export function compare(a: Service, b: Service): boolean {
  if (a.name !== b.name) {
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
