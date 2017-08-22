import { navigation, routing } from "foundation-ui";

import Selects from "../../pages/ui-components/Selects";

module.exports = {
  title: "Selects",
  pathName: "selects",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Selects,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
