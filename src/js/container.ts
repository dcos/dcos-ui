import "reflect-metadata"; // Needed for inversify
import { ContainerModule } from "inversify";
import { Container, bindExtensionProvider } from "extension-kid";

import mesosStream, { MesosStreamType } from "./core/MesosStream";
import DataLayer, { DataLayerExtensionType, DataLayerType } from "./dataLayer";

const container = new Container();

container.bind(MesosStreamType).toConstantValue(mesosStream);
const dataLayerModule = new ContainerModule(bind => {
  bindExtensionProvider(bind, DataLayerExtensionType);
});

container.load(dataLayerModule);

container.bindAsync(DataLayerType, bts => {
  bts.to(DataLayer).inSingletonScope();
});
export default container;
