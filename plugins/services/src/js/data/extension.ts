import {
  DataLayerExtensionInterface,
  getExtensionModule
} from "@extension-kid/data-layer";
import { injectable } from "inversify";

import Config from "#SRC/js/config/Config";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const serviceResolvers = resolvers({
  pollingInterval: Config.getRefreshRate()
});

const ServicesType = Symbol("ServiceDataLayer");
@injectable()
class ServicesExtension implements DataLayerExtensionInterface {
  id = ServicesType;

  getResolvers() {
    return serviceResolvers;
  }

  getTypeDefinitions() {
    return typeDefs;
  }
}

export default (_context = {}) => getExtensionModule(ServicesExtension);
