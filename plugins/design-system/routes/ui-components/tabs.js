import { navigation, routing } from "foundation-ui";

import Tabs from "../../pages/ui-components/Tabs";

module.exports = {
  title: "Tabs",
  pathName: "tabs",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Tabs,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
