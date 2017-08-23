import { navigation, routing } from "foundation-ui";

import Checkboxes from "../../pages/ui-components/Checkboxes";

module.exports = {
  title: "Checkboxes",
  pathName: "checkboxes",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Checkboxes,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
