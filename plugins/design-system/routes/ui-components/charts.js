import { navigation, routing } from "foundation-ui";

import Charts from "../../pages/ui-components/Charts";

module.exports = {
  title: "Charts",
  pathName: "charts",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Charts,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
