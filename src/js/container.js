import { Container } from "inversify";

import mesosStream, { MesosStreamType } from "./core/MesosStream";
import updateStream, { UpdateStreamType } from "./core/UpdateStream";

const container = new Container();

container.bind(MesosStreamType).toConstantValue(mesosStream);
container.bind(UpdateStreamType).toConstantValue(updateStream);

export default container;
