import { navigation, routing } from "foundation-ui";

import Breadcrumbs from "../../pages/ui-components/Breadcrumbs";

module.exports = {
  title: "Breadcrumbs",
  pathName: "breadcrumbs",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Breadcrumbs,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
