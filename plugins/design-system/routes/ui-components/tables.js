import { navigation, routing } from "foundation-ui";

import Tables from "../../pages/ui-components/Tables";

module.exports = {
  title: "Tables",
  pathName: "tables",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Tables,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
