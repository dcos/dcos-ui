import "reflect-metadata"; // Needed for inversify
import { Container } from "@extension-kid/core";
import notificationServiceFactory from "@extension-kid/notification-service";

import mesosStream, { MesosStreamType } from "./core/MesosStream";

const container = new Container();

container.bind(MesosStreamType).toConstantValue(mesosStream);
container.load(notificationServiceFactory());

export default container;
