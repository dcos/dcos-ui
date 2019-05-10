import {
  ToastAppearance,
  ToastNotification,
  ToastNotificationOptions
} from "../ToastNotification";

describe("ToastNotification", () => {
  describe("#constructor", () => {
    let title: string, options: ToastNotificationOptions, callback: jest.Mock;

    beforeEach(() => {
      callback = jest.fn();
      options = {
        appearance: ToastAppearance.Danger,
        autodismiss: true,
        callback,
        description: "A description",
        primaryActionText: "My action",
        secondaryActionText: "other action"
      };
      title = "my test";
    });

    it("sets title property", () => {
      const notification = new ToastNotification(title);
      expect(notification.type).toEqual(ToastNotification.NotificationType);
    });

    it("sets title property", () => {
      const notification = new ToastNotification(title, options);
      expect(notification.title).toEqual("my test");
    });

    it("sets appearance property", () => {
      const notification = new ToastNotification(title, options);
      expect(notification.appearance).toEqual(ToastAppearance.Danger);
    });

    it("sets autodismiss property", () => {
      const notification = new ToastNotification(title, options);
      expect(notification.autodismiss).toEqual(true);
    });

    it("sets callback property", () => {
      const notification = new ToastNotification(title, options);
      expect(notification.callback).toEqual(callback);
    });

    it("sets description property", () => {
      const notification = new ToastNotification(title, options);
      expect(notification.description).toEqual("A description");
    });

    it("sets primaryActionText property", () => {
      const notification = new ToastNotification(title, options);
      expect(notification.primaryActionText).toEqual("My action");
    });

    it("sets secondaryActionText property", () => {
      const notification = new ToastNotification(title, options);
      expect(notification.secondaryActionText).toEqual("other action");
    });
  });
});
