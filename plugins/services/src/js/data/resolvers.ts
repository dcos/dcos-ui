import { Observable } from "rxjs";
import { RequestResponse } from "@dcos/http-service";

import { resolvers as GroupResolvers } from "./groups";
import { resolvers as ServicesResolvers } from "./services/resolvers";
import { ServicePlanResponse } from "./ServicePlansClient";

export interface ResolverArgs {
  fetchServicePlans: (
    serviceId: string
  ) => Observable<RequestResponse<string[]>>;
  fetchServicePlanDetail: (
    serviceId: string,
    planName: string
  ) => Observable<RequestResponse<ServicePlanResponse>>;
  pollingInterval: number;
}

export const resolvers = (args: ResolverArgs) => {
  const groupResolvers = GroupResolvers({
    pollingInterval: args.pollingInterval
  });
  const servicesResolvers = ServicesResolvers({
    fetchServicePlans: args.fetchServicePlans,
    fetchServicePlanDetail: args.fetchServicePlanDetail,
    pollingInterval: args.pollingInterval
  });
  const Query = {
    ...groupResolvers.Query,
    ...servicesResolvers.Query
  };
  return { ...groupResolvers, ...servicesResolvers, Query };
};
