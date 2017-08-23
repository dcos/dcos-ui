import { navigation, routing } from "foundation-ui";

import Banners from "../../pages/ui-components/Banners";

module.exports = {
  title: "Banners",
  pathName: "banners",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Banners,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
