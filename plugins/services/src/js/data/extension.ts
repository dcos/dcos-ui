import {
  DataLayerExtensionInterface,
  getExtensionModule
} from "@extension-kid/data-layer";
import { injectable } from "inversify";

import Config from "#SRC/js/config/Config";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

import {
  fetchPlanDetails as fetchServicePlanDetail,
  fetchPlans as fetchServicePlans
} from "./ServicePlansClient";

const serviceResolvers = resolvers({
  fetchServicePlans,
  fetchServicePlanDetail,
  pollingInterval: Config.getRefreshRate()
});

const ServicesType = Symbol("ServiceDataLayer");
@injectable()
class ServicesExtension implements DataLayerExtensionInterface {
  public id = ServicesType;

  public getResolvers() {
    return serviceResolvers;
  }

  public getTypeDefinitions() {
    return typeDefs;
  }
}

export default (_context = {}) => getExtensionModule(ServicesExtension);
