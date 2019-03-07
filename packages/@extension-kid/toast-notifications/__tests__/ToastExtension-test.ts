import ToasterExtension from "../ToastExtension";
import { ToastCallbackType, ToastNotification } from "../ToastNotification";

describe("ToasterExtension", () => {
  describe("#supportedNotifications", () => {
    it("returns toast symbol", () => {
      const ext = new ToasterExtension();

      expect(ext.supportedNotifications()).toEqual([
        ToastNotification.NotificationType
      ]);
    });
  });

  describe("#push", () => {
    it("updates stream when new notification is pushed", () => {
      const ext = new ToasterExtension();
      const notification = new ToastNotification("unit test");
      const nextCallback = jest.fn();
      ext.Toast$.subscribe(nextCallback);

      ext.push(notification);

      expect(nextCallback).toHaveBeenCalledTimes(2);
    });

    it("new toasts are added to observable's list", () => {
      const ext = new ToasterExtension();
      const notification = new ToastNotification("unit test");
      const nextCallback = jest.fn();
      ext.Toast$.subscribe(nextCallback);

      nextCallback.mockReset();
      ext.push(notification);

      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith([notification]);
    });

    it("can received multiple toasts", () => {
      const ext = new ToasterExtension();
      const notification01 = new ToastNotification("unit test one");
      const notification02 = new ToastNotification("unit test two");
      const nextCallback = jest.fn();
      ext.Toast$.subscribe(nextCallback);
      nextCallback.mockReset();

      ext.push(notification01);

      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith([notification01]);
      nextCallback.mockReset();

      ext.push(notification02);
      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith([
        notification01,
        notification02
      ]);
    });
  });

  describe("#dismissToast", () => {
    it("removes notifications when dismissed", () => {
      const ext = new ToasterExtension();
      const notification01 = new ToastNotification("unit test one");
      const notification02 = new ToastNotification("unit test two");
      const nextCallback = jest.fn();
      ext.Toast$.subscribe(nextCallback);
      nextCallback.mockReset();

      ext.push(notification01);
      ext.push(notification02);
      nextCallback.mockReset();

      ext.dismissToast(notification01.id);
      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith([notification02]);
    });

    it("doesn't emit if notification not found", () => {
      const ext = new ToasterExtension();
      const nextCallback = jest.fn();
      ext.Toast$.subscribe(nextCallback);
      expect(nextCallback).toHaveBeenCalledWith([]);
      nextCallback.mockReset();

      ext.dismissToast("I.dont.exist");
      expect(nextCallback).not.toHaveBeenCalled();
    });

    it("invokes notification callback when dismissed", () => {
      const ext = new ToasterExtension();
      const notificationCallback = jest.fn();

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      ext.dismissToast(notification01.id);
      expect(notificationCallback).toHaveBeenCalledTimes(1);
      expect(notificationCallback).toHaveBeenCalledWith(
        ToastCallbackType.Dismiss,
        notification01
      );
    });

    it("invokes notification callback when dismissed", () => {
      const ext = new ToasterExtension();
      const notificationCallback = jest.fn();

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      ext.dismissToast(notification01.id);
      expect(notificationCallback).toHaveBeenCalled();
    });
  });

  describe("#toastPrimaryAction", () => {
    it("removes notification action executed", () => {
      const ext = new ToasterExtension();
      const notification01 = new ToastNotification("unit test one");
      const nextCallback = jest.fn();
      ext.Toast$.subscribe(nextCallback);
      ext.push(notification01);
      nextCallback.mockReset();
      expect(ext.Toast$.getValue()).toEqual([notification01]);

      ext.toastPrimaryAction(notification01.id);
      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith([]);
    });
    it("invokes notification callback when dismissed", () => {
      const ext = new ToasterExtension();
      const notificationCallback = jest.fn();

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      ext.toastPrimaryAction(notification01.id);
      expect(notificationCallback).toHaveBeenCalled();
      expect(notificationCallback).toHaveBeenCalledWith(
        ToastCallbackType.Primary,
        notification01
      );
    });
  });

  describe("#toastSecondaryAction", () => {
    it("removes notification action executed", () => {
      const ext = new ToasterExtension();
      const notification01 = new ToastNotification("unit test one");
      const nextCallback = jest.fn();
      ext.Toast$.subscribe(nextCallback);
      ext.push(notification01);
      nextCallback.mockReset();
      expect(ext.Toast$.getValue()).toEqual([notification01]);

      ext.toastSecondaryAction(notification01.id);
      expect(nextCallback).toHaveBeenCalledTimes(1);
      expect(nextCallback).toHaveBeenCalledWith([]);
    });
    it("invokes notification callback when dismissed", () => {
      const ext = new ToasterExtension();
      const notificationCallback = jest.fn();

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      ext.toastSecondaryAction(notification01.id);
      expect(notificationCallback).toHaveBeenCalled();
      expect(notificationCallback).toHaveBeenCalledWith(
        ToastCallbackType.Secondary,
        notification01
      );
    });
  });
});
