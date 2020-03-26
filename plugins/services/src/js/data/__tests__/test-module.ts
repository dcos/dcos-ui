import {
  DataLayerExtensionInterface,
  getExtensionModule,
} from "@extension-kid/data-layer";
import { ContainerModule, injectable } from "inversify";

import Config from "#SRC/js/config/Config";

import { typeDefs } from "../schema";
import { resolvers } from "../resolvers";
import {
  fetchPlanDetails as fetchServicePlanDetail,
  fetchPlans as fetchServicePlans,
  ServicePlanResponse,
} from "../ServicePlansClient";
import { IResolvers } from "graphql-tools";
import { Observable } from "rxjs";
import { RequestResponse } from "@dcos/http-service";

let serviceResolvers: IResolvers;

export interface TestResolverArgs {
  fetchServicePlans?: (
    serviceId: string
  ) => Observable<RequestResponse<string[]>>;
  fetchServicePlanDetail?: (
    serviceId: string,
    planName: string
  ) => Observable<RequestResponse<ServicePlanResponse>>;
  pollingInterval?: number;
}

function makeResolvers(
  args: TestResolverArgs | null = null,
  overwrite = false
) {
  if (serviceResolvers && !overwrite) {
    return serviceResolvers;
  }
  let resolverArgs = {
    fetchServicePlans,
    fetchServicePlanDetail,
    pollingInterval: Config.getRefreshRate(),
  };
  if (args) {
    resolverArgs = { ...resolverArgs, ...args };
  }
  serviceResolvers = resolvers(resolverArgs);
  return serviceResolvers;
}

const ServicesType = Symbol("ServiceTestDataLayer");
@injectable()
class ServicesTestExtension implements DataLayerExtensionInterface {
  public id = ServicesType;

  public getResolvers() {
    return makeResolvers();
  }

  public getTypeDefinitions() {
    return typeDefs;
  }
}

export default (
  args: TestResolverArgs | null = null
): ContainerModule | null => {
  makeResolvers(args, true);
  return getExtensionModule(ServicesTestExtension);
};
