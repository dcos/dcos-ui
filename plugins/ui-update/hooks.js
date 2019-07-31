import { MountService } from "foundation-ui";

import container from "#SRC/js/container";

import UIDetails from "./components/UIDetails";
import { loadNotifications, UIUpdateNotificationsType } from "./notifications";
import { getSDK } from "./SDK";

const SDK = getSDK();

module.exports = {
  actions: ["userLoginSuccess", "userLogoutSuccess", "redirectToLogin"],
  notifications: {
    updated: null,
    updateFailed: null,
    rollbackFailed: null
  },

  initialize() {
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });

    MountService.MountService.registerComponent(
      UIDetails,
      "UISettings:UIDetails:Content"
    );

    loadNotifications(container);
  },
  registerNotifications() {
    console.log("notifications being registered");
    const notifications = container.get(UIUpdateNotificationsType);
    if (!notifications) {
      return;
    }
    if (this.notifications.updated === null) {
      this.notifications.updated = notifications.setupUIUpdatedNotification();
    }
    if (this.notifications.updateFailed === null) {
      this.notifications.updateFailed = notifications.setupUpdateFailedNotification();
    }
    if (this.notifications.rollbackFailed === null) {
      this.notifications.rollbackFailed = notifications.setupRollbackFailedNotification();
    }
  },
  unregisterNotifications() {
    for (const key in this.notifications) {
      if (this.notifications[key] !== null) {
        this.notifications[key].unsubscribe();
        this.notifications[key] = null;
      }
    }
  },

  userLoginSuccess() {
    this.registerNotifications();
  },
  userLogoutSuccess() {
    this.unregisterNotifications();
  },
  redirectToLogin() {
    this.unregisterNotifications();
  }
};
