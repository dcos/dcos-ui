import { Container } from "inversify";
import pluginBaby, { ApplicationExtension } from "plugin-baby";

import DCOSApplication from "./core/DCOSApplication";
import mesosStream, { MesosStreamType } from "./core/MesosStream";

const container = new Container();

container.load(pluginBaby);
container.bind(ApplicationExtension).to(DCOSApplication).inSingletonScope();
container.bind(MesosStreamType).toConstantValue(mesosStream);

export default container;
