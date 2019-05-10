import ToasterExtension from "../ToastExtension";
import { ToastCallbackType, ToastNotification } from "../ToastNotification";

describe("ToasterExtension", () => {
  let ext: ToasterExtension, toast$NextCallback: jest.Mock;
  beforeEach(() => {
    ext = new ToasterExtension();
    toast$NextCallback = jest.fn();
    ext.Toast$.subscribe(toast$NextCallback);
    jest.resetAllMocks();
  });

  describe("#supportedNotifications", () => {
    it("returns toast symbol", () => {
      expect(ext.supportedNotifications()).toEqual([
        ToastNotification.NotificationType
      ]);
    });
  });

  describe("#push", () => {
    it("updates stream when new notification is pushed", () => {
      const notification = new ToastNotification("unit test");

      ext.push(notification);

      expect(toast$NextCallback).toHaveBeenCalledTimes(1);
    });

    it("new toasts are added to observable's list", () => {
      const notification = new ToastNotification("unit test");
      ext.push(notification);

      expect(toast$NextCallback).toHaveBeenCalledTimes(1);
      expect(toast$NextCallback).toHaveBeenCalledWith([notification]);
    });

    it("can received multiple toasts", () => {
      const notification01 = new ToastNotification("unit test one");
      const notification02 = new ToastNotification("unit test two");

      ext.push(notification01);

      expect(toast$NextCallback).toHaveBeenCalledTimes(1);
      expect(toast$NextCallback).toHaveBeenCalledWith([notification01]);
      toast$NextCallback.mockReset();

      ext.push(notification02);
      expect(toast$NextCallback).toHaveBeenCalledTimes(1);
      expect(toast$NextCallback).toHaveBeenCalledWith([
        notification01,
        notification02
      ]);
    });
  });

  describe("#dismissToast", () => {
    it("removes notifications when dismissed", () => {
      const notification01 = new ToastNotification("unit test one");
      const notification02 = new ToastNotification("unit test two");
      const notification03 = new ToastNotification("unit test three");

      ext.push(notification01);
      ext.push(notification02);
      ext.push(notification03);
      toast$NextCallback.mockReset();

      ext.dismissToast(notification02.id);
      expect(toast$NextCallback).toHaveBeenCalledTimes(1);
      expect(toast$NextCallback).toHaveBeenCalledWith([
        notification01,
        notification03
      ]);
    });

    it("doesn't emit if notification not found", () => {
      ext.dismissToast("I.dont.exist");
      expect(toast$NextCallback).not.toHaveBeenCalled();
    });

    it("invokes notification callback when dismissed", () => {
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
      const notificationCallback = jest.fn();

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      ext.dismissToast(notification01.id);
      expect(notificationCallback).toHaveBeenCalled();
    });

    it("swallows errors from callback", () => {
      const notificationCallback = () => {
        throw new Error("Boom!");
      };

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      expect(ext.dismissToast.bind(ext, notification01.id)).not.toThrow();
    });
  });

  describe("#toastPrimaryAction", () => {
    it("removes notification action executed", () => {
      const notification01 = new ToastNotification("unit test one");
      ext.push(notification01);
      toast$NextCallback.mockReset();

      ext.toastPrimaryAction(notification01.id);
      expect(toast$NextCallback).toHaveBeenCalledTimes(1);
      expect(toast$NextCallback).toHaveBeenCalledWith([]);
    });
    it("invokes notification callback when dismissed", () => {
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
    it("swallows errors from callback", () => {
      const notificationCallback = () => {
        throw new Error("Boom!");
      };

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      expect(ext.toastPrimaryAction.bind(ext, notification01.id)).not.toThrow();
    });
  });

  describe("#toastSecondaryAction", () => {
    it("removes notification action executed", () => {
      const notification01 = new ToastNotification("unit test one");
      ext.push(notification01);
      toast$NextCallback.mockReset();

      ext.toastSecondaryAction(notification01.id);
      expect(toast$NextCallback).toHaveBeenCalledTimes(1);
      expect(toast$NextCallback).toHaveBeenCalledWith([]);
    });
    it("invokes notification callback when dismissed", () => {
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
    it("swallows errors from callback", () => {
      const notificationCallback = () => {
        throw new Error("Boom!");
      };

      const notification01 = new ToastNotification("unit test one", {
        callback: notificationCallback
      });
      ext.push(notification01);
      expect(
        ext.toastSecondaryAction.bind(ext, notification01.id)
      ).not.toThrow();
    });
  });
});
