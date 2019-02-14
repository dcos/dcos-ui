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
container.load(notificationServiceFactory());

const toastsExtension = toastsExtensionFactory();
if (toastsExtension) {
  container.load(toastsExtension);
} else {
  // tslint:disable-next-line
  console.error("Could not load toasts extension, please check export");
}

container.load(dataLayerExtensionFactory());

const jobsExtension = jobsExtensionFactory();
if (jobsExtension) {
  container.load(jobsExtension);
} else {
  // tslint:disable-next-line
  console.error("Could not load jobs extension, please check the export");
}

const repositoriesExtension = repositoriesExtensionFactory();
if (repositoriesExtension) {
  container.load(repositoriesExtension);
} else {
  // tslint:disable-next-line
  console.error(
    "Could not load repositories extension, please check the export"
  );
}

export default container;
