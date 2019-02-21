import "reflect-metadata"; // Needed for inversify
import { Container } from "@extension-kid/core";

import mesosStream, { MesosStreamType } from "./core/MesosStream";

const container = new Container();

container.bind(MesosStreamType).toConstantValue(mesosStream);

export default container;
