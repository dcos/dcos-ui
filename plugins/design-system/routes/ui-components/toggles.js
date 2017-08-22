import { navigation, routing } from "foundation-ui";

import Toggles from "../../pages/ui-components/Toggles";

module.exports = {
  title: "Toggles",
  pathName: "toggles",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Toggles,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
