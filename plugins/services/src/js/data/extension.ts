import {
  DataLayerExtensionInterface,
  getExtensionModule
} from "@extension-kid/data-layer";
import { injectable } from "inversify";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const ServicesType = Symbol("ServiceDataLayer");
@injectable()
class ServicesExtension implements DataLayerExtensionInterface {
  id = ServicesType;

  getResolvers() {
    return resolvers;
  }

  getTypeDefinitions() {
    return typeDefs;
  }
}

export default (_context = {}) => getExtensionModule(ServicesExtension);
