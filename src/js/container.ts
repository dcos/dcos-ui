import "reflect-metadata"; // Needed for inversify
import { Container } from "@extension-kid/core";
import notificationServiceFactory from "@extension-kid/notification-service";
import toastsExtensionFactory from "@extension-kid/toast-notifications";
import dataLayerExtensionFactory from "@extension-kid/data-layer";
import jobsExtensionFactory from "#PLUGINS/jobs/src/js";
import repositoriesExtensionFactory from "#PLUGINS/catalog/src/js/index";
import servicesExtensionFactory from "#PLUGINS/services/src/js/data/extension";
import cosmosExtensionFactory from "./data/cosmos";
import uiMetadataExtensionFactor from "./data/ui-update";

import mesosStream, { MesosStreamType } from "./core/MesosStream";
import mesosMasterRequest, {
  MesosMasterRequestType,
} from "./core/MesosMasterRequest";
import { TYPES } from "./types/containerTypes";
import { i18n } from "./i18n";

const container = new Container();
container.bind(MesosStreamType).toConstantValue(mesosStream);
container.bind(MesosMasterRequestType).toConstantValue(mesosMasterRequest);
container.bind(TYPES.I18n).toConstantValue(i18n);

const factories = {
  notification: notificationServiceFactory,
  toast: toastsExtensionFactory,
  dataLayer: dataLayerExtensionFactory,
  jobs: jobsExtensionFactory,
  repositoriesExtension: repositoriesExtensionFactory,
  services: servicesExtensionFactory,
  cosmos: cosmosExtensionFactory,
  uiMetadata: uiMetadataExtensionFactor,
};

Object.entries(factories).forEach(([name, factory]) => {
  const containerModule = factory();
  if (containerModule) {
    container.load(containerModule);
  } else {
    console.error(`Could not load ${name} extension, please check export`);
  }
});

export default container;
