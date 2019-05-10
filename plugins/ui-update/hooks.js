import { MountService } from "foundation-ui";

import container from "#SRC/js/container";

import UIDetails from "./components/UIDetails";
import { loadNotifications, UIUpdateNotificationsType } from "./notifications";

module.exports = {
  initialize() {
    loadNotifications(container);

    MountService.MountService.registerComponent(
      UIDetails,
      "UISettings:UIDetails:Content"
    );

    const notifications = container.get(UIUpdateNotificationsType);
    if (notifications) {
      notifications.setupUIUpdatedNotification();
      notifications.setupUpdateFailedNotification();
      notifications.setupRollbackFailedNotification();
    }
  }
};
