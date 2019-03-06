import { Container } from "@extension-kid/core";
import notificationServiceContainerModuleFactory, {
  getExtensionModule,
  Notification,
  NotificationService,
  NotificationServiceType,
  NotificationServiceExtensionInterface
} from "../index";
import { injectable } from "inversify";

const DebugNotification = Symbol("DebugNotification");

const DebugSymbol = Symbol("Debug");

@injectable()
class DebugNotificationExtension
  implements NotificationServiceExtensionInterface {
  id = DebugSymbol;

  supportedNotifications() {
    return [DebugNotification];
  }

  push(notification: Notification) {
    /* tslint:disable */
    console.log(
      `${notification.timestamp.toISOString()} - DEBUG - ${
        notification.message
      }`
    );
    /* tslint:enable */
  }
}

describe("NotificationService", () => {
  let container: Container;
  beforeEach(() => {
    container = new Container();

    container.load(notificationServiceContainerModuleFactory());
  });

  it("can get Notification service", () => {
    const ns = container.get<NotificationService>(NotificationServiceType);
    expect(ns).not.toBeNull();
  });

  it("doesn't error without extensions", () => {
    const ns = container.get<NotificationService>(NotificationServiceType);

    ns.push(new Notification(DebugNotification, "This is a test"));
  });

  describe("#push", () => {
    it("sends typed notification to extension", () => {
      container.load(getExtensionModule(DebugNotificationExtension));
      const logSpy = jest.spyOn(console, "log");

      const ns = container.get<NotificationService>(NotificationServiceType);

      ns.push(new Notification(DebugNotification, "This is another test"));

      expect(logSpy).toHaveBeenCalledTimes(1);
      logSpy.mockRestore();
    });

    it("filters extensions based on type", () => {
      container.load(getExtensionModule(DebugNotificationExtension));
      const logSpy = jest.spyOn(console, "log");

      const ns = container.get<NotificationService>(NotificationServiceType);

      ns.push(new Notification(Symbol("Other_Type"), "This is another test"));

      expect(logSpy).not.toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });

  describe("#findExtension", () => {
    it("can find extension", () => {
      container.load(getExtensionModule(DebugNotificationExtension));

      const ns = container.get<NotificationService>(NotificationServiceType);
      const ext = ns.findExtension(DebugSymbol);

      expect(ext).not.toBeUndefined();
    });

    it("returns undefined if extension isn't loaded", () => {
      const ns = container.get<NotificationService>(NotificationServiceType);
      const ext = ns.findExtension(DebugSymbol);

      expect(ext).toBeUndefined();
    });
  });
});
