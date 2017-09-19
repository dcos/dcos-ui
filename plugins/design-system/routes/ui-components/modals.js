import { navigation, routing } from "foundation-ui";

import Modals from "../../pages/ui-components/Modals";

module.exports = {
  title: "Modals",
  pathName: "modals",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Modals,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
