import { ContainerModule } from "inversify";
import { bindExtensionProvider } from "@extension-kid/core";

import DataLayer, {
  DataLayerExtensionType,
  DataLayerType,
  DataLayerExtensionInterface
} from "./dataLayer";

export {
  getExtensionModule,
  DataLayerExtensionType,
  DataLayerType,
  DataLayerExtensionInterface,
  DataLayer
};

function getExtensionModule<T>(extension: { new (...args: any[]): T }) {
  if (!extension) {
    return null;
  }

  return new ContainerModule(bind => {
    bind(DataLayerExtensionType)
      .to(extension)
      .inSingletonScope();
  });
}

export default (_context = {}) =>
  new ContainerModule(bind => {
    bindExtensionProvider(bind, DataLayerExtensionType);
    bind(DataLayerType)
      .to(DataLayer)
      .inSingletonScope();
  });
