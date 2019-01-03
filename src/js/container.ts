import "reflect-metadata"; // Needed for inversify
import { ContainerModule } from "inversify";
import { Container, bindExtensionProvider } from "extension-kid";

import mesosStream, { MesosStreamType } from "./core/MesosStream";
import DataLayer, {
  DataLayerExtensionSymbol,
  DataLayerSymbol
} from "./dataLayer";

const container = new Container();

container.bind(MesosStreamType).toConstantValue(mesosStream);
const dataLayerModule = new ContainerModule(bind => {
  bindExtensionProvider(bind, DataLayerExtensionSymbol);
});

container.load(dataLayerModule);

container.bindAsync(DataLayerSymbol, bts => {
  bts.to(DataLayer).inSingletonScope();
});
export default container;
