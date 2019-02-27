import { MountService } from "foundation-ui";

import UIDetails from "./components/UIDetails";

module.exports = {
  initialize() {
    MountService.MountService.registerComponent(
      UIDetails,
      "UISettings:UIDetails:Content"
    );
  }
};
