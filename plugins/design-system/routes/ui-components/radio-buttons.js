import { navigation, routing } from "foundation-ui";

import RadioButtons from "../../pages/ui-components/RadioButtons";

module.exports = {
  title: "Radio Buttons",
  pathName: "radio-buttons",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      RadioButtons,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
