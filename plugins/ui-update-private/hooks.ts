import { MountService } from "foundation-ui";

import container from "#SRC/js/container";
import UIDetails from "#PLUGINS/ui-update/components/UIDetails";
import FallbackScreen from "#PLUGINS/ui-update/components/FallbackScreen";
import {
  loadNotifications,
  UIUpdateNotificationsType
} from "#PLUGINS/ui-update/notifications";
import { getSDK } from "./SDK";

const SDK = getSDK();
const { Hooks } = SDK;

module.exports = {
  actions: ["userCapabilitiesFetched", "userLogoutSuccess", "redirectToLogin"],
  notifications: {
    updated: null,
    updateFailed: null,
    rollbackFailed: null
  },

  initialize() {
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });

    loadNotifications(container);
  },

  registerNotifications(hasUiUpdate) {
    const notifications = container.get(UIUpdateNotificationsType);
    if (!notifications) {
      return;
    }
    if (this.notifications.updated === null) {
      this.notifications.updated = notifications.setupUIUpdatedNotification();
    }
    if (hasUiUpdate) {
      if (this.notifications.updateFailed === null) {
        this.notifications.updateFailed = notifications.setupUpdateFailedNotification();
      }
      if (this.notifications.rollbackFailed === null) {
        this.notifications.rollbackFailed = notifications.setupRollbackFailedNotification();
      }
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

  userCapabilitiesFetched() {
    if (!Hooks.applyFilter("hasCapability", false, "uiUpdate")) {
      // Displayed limited capabilities if user isn't superadmin
      MountService.MountService.registerComponent(
        FallbackScreen,
        "UISettings:UIDetails:Content"
      );
      this.registerNotifications(false);
    } else {
      MountService.MountService.registerComponent(
        UIDetails,
        "UISettings:UIDetails:Content"
      );
      this.registerNotifications(true);
    }
  },
  userLogoutSuccess() {
    this.unregisterNotifications();
  },
  redirectToLogin() {
    this.unregisterNotifications();
  }
};
