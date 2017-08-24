import { navigation, routing } from "foundation-ui";

import Buttons from "../../pages/ui-components/Buttons";

module.exports = {
  title: "Buttons",
  pathName: "buttons",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Buttons,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
