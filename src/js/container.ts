import "reflect-metadata"; // Needed for inversify
import { Container } from "@extension-kid/core";
import notificationServiceFactory from "@extension-kid/notification-service";
import toastsExtensionFactory from "@extension-kid/toast-notifications";
import dataLayerExtensionFactory from "@extension-kid/data-layer";
import jobsExtensionFactory from "#PLUGINS/jobs/src/js";
import repositoriesExtensionFactory from "#PLUGINS/catalog/src/js";

import mesosStream, { MesosStreamType } from "./core/MesosStream";

const container = new Container();
container.bind(MesosStreamType).toConstantValue(mesosStream);

const factories = {
  notification: notificationServiceFactory,
  toast: toastsExtensionFactory,
  dataLayer: dataLayerExtensionFactory,
  jobs: jobsExtensionFactory,
  repositoriesExtension: repositoriesExtensionFactory
};

Object.entries(factories).forEach(([name, factory]) => {
  const containerModule = factory();
  if (containerModule) {
    container.load(containerModule);
  } else {
    // tslint:disable-next-line
    console.error(`Could not load ${name} extension, please check export`);
  }
});

export default container;
