import { navigation, routing } from "foundation-ui";

import Badges from "../../pages/ui-components/Badges";

module.exports = {
  title: "Badges",
  pathName: "badges",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Badges,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
