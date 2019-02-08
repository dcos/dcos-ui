import { ContainerModule } from "inversify";
import { bindExtensionProvider } from "extension-kid";

import DataLayer, {
  DataLayerExtensionType,
  DataLayerType,
  DataLayerExtensionInterface
} from "./dataLayer";

export {
  DataLayerExtensionType,
  DataLayerType,
  DataLayerExtensionInterface,
  DataLayer
};

export default (_context = {}) =>
  new ContainerModule(bind => {
    bindExtensionProvider(bind, DataLayerExtensionType);
    bind(DataLayerType)
      .to(DataLayer)
      .inSingletonScope();
  });
