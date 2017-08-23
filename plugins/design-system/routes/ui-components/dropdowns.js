import { navigation, routing } from "foundation-ui";

import Dropdowns from "../../pages/ui-components/Dropdowns";

module.exports = {
  title: "Dropdowns",
  pathName: "dropdowns",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Dropdowns,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
