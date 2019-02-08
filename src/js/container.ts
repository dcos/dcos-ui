import "reflect-metadata"; // Needed for inversify
import { Container } from "@extension-kid/core";
import notificationServiceFactory from "@extension-kid/notification-service";
import toastsExtensionFactory from "@extension-kid/toast-notifications";


import dataLayerExtensionFactory from "@extension-kid/data-layer";
import jobsExtensionFactory from "#PLUGINS/jobs/src/js";

import mesosStream, { MesosStreamType } from "./core/MesosStream";

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

container.load(dataLayerExtensionFactory());
container.load(jobsExtensionFactory());

export default container;
