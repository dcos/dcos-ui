import { injectable, inject, named } from "inversify";
import { ExtensionProvider } from "@extension-kid/core";

import { Notification } from "./Notification";

const NotificationServiceExtensionType = Symbol("NotificationServiceExtension");
const NotificationServiceType = Symbol("NotificationService");
interface NotificationServiceExtensionInterface {
  id: symbol;
  supportedNotifications(): symbol[];
  push(notification: Notification): void;
}

@injectable()
class NotificationService {
  extensionType = NotificationServiceExtensionType;
  _extensionProvider: ExtensionProvider<NotificationServiceExtensionInterface>;

  constructor(
    @inject(ExtensionProvider)
    @named(NotificationServiceExtensionType)
    extensionProvider: ExtensionProvider<NotificationServiceExtensionInterface>
  ) {
    this._extensionProvider = extensionProvider;
  }

  push(notification: Notification): void {
    this._extensionProvider
      .getAllExtensions()
      .filter(extension =>
        extension.supportedNotifications().includes(notification.type)
      )
      .forEach(extension => {
        extension.push(notification);
      });
  }
}

export {
  NotificationService as default,
  NotificationServiceExtensionType,
  NotificationServiceType,
  NotificationServiceExtensionInterface
};
