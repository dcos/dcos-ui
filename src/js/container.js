import pluginBaby, {
  ApplicationExtension,
  EventedContainer
} from "plugin-baby";

import sdk from "dcos-sdk";

import catalogModuleFactory from "#PLUGINS/catalog";

import DCOSApplication from "./core/DCOSApplication";
import mesosStream, { MesosStreamType } from "./core/MesosStream";
import legacyModuleFactory from "./legacy";

const container = new EventedContainer();

container.load(pluginBaby);
container.load(sdk);

container.bind(ApplicationExtension).to(DCOSApplication).inSingletonScope();
container.bind(MesosStreamType).toConstantValue(mesosStream);

container.load(legacyModuleFactory());
container.load(catalogModuleFactory());

export default container;
