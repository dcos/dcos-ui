import { MountService } from "foundation-ui";

import UIDetails from "./components/UIDetails";
import * as Notifications from "./notifications";

module.exports = {
  initialize() {
    MountService.MountService.registerComponent(
      UIDetails,
      "UISettings:UIDetails:Content"
    );

    Notifications.setupUIUpdatedNotification();
    Notifications.setupUpdateFailedNotification();
    Notifications.setupRollbackFailedNotification();
  }
};
