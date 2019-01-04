import "reflect-metadata"; // Needed for inversify
import { Container, bindExtensionProvider } from "@extension-kid/core";
import notificationServiceFactory from "@extension-kid/notification-service";
import toastsExtensionFactory from "@extension-kid/toast-notifications";
import { ContainerModule } from "inversify";

import mesosStream, { MesosStreamType } from "./core/MesosStream";
import DataLayer, { DataLayerExtensionType, DataLayerType } from "./dataLayer";

const container = new Container();

container.bind(MesosStreamType).toConstantValue(mesosStream);
container.load(notificationServiceFactory());

const toastsExtension = toastsExtensionFactory();
if (toastsExtension) {
  container.load(toastsExtension);
} else {
  // tslint:disable-next-line
  console.error("Could not load toasts extension, please check export");
}

const dataLayerModule = new ContainerModule(bind => {
  bindExtensionProvider(bind, DataLayerExtensionType);
});

container.load(dataLayerModule);

container.bindAsync(DataLayerType, bts => {
  bts.to(DataLayer).inSingletonScope();
});

export default container;
