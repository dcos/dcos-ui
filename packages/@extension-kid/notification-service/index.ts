import { ContainerModule } from "inversify";
import { bindExtensionProvider } from "@extension-kid/core";
import { Notification } from "./Notification";

import NotificationService, {
  NotificationServiceExtensionType,
  NotificationServiceType,
  NotificationServiceExtensionInterface
} from "./NotificationService";

function getExtensionModule(extension) {
  if (!extension) {
    throw new Error("extension must be provided");
  }

  return new ContainerModule(bind => {
    bind(NotificationServiceExtensionType)
      .to(extension)
      .inSingletonScope();
  });
}

function bindService(_context = {}) {
  return new ContainerModule(bind => {
    bindExtensionProvider(bind, NotificationServiceExtensionType);
    bind(NotificationServiceType)
      .to(NotificationService)
      .inSingletonScope();
  });
}

export {
  bindService as default,
  getExtensionModule,
  Notification,
  NotificationServiceExtensionType,
  NotificationServiceType,
  NotificationServiceExtensionInterface,
  NotificationService
};
