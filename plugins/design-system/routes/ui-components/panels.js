import { navigation, routing } from "foundation-ui";

import Panels from "../../pages/ui-components/Panels";

module.exports = {
  title: "Panels",
  pathName: "panels",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Panels,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
