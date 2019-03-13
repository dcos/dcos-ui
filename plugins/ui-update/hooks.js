import { MountService } from "foundation-ui";
import { NotificationServiceType } from "@extension-kid/notification-service";

import container from "#SRC/js/container";

import UIDetails from "./components/UIDetails";
import * as Notifications from "./notifications";

module.exports = {
  initialize() {
    MountService.MountService.registerComponent(
      UIDetails,
      "UISettings:UIDetails:Content"
    );

    const notificationService = container.get(NotificationServiceType);
    if (notificationService) {
      Notifications.setupUIUpdatedNotification(notificationService);
      Notifications.setupUpdateFailedNotification(notificationService);
      Notifications.setupRollbackFailedNotification(notificationService);
    }
  }
};
