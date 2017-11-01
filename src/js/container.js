import { Container } from "inversify";

import mesosStream, { MesosStreamType } from "./core/MesosStream";

const container = new Container();

container.bind(MesosStreamType).toConstantValue(mesosStream);

export default container;
