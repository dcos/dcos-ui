import { navigation, routing } from "foundation-ui";

import LoadingIndicators from "../../pages/ui-components/LoadingIndicators";

module.exports = {
  title: "Loading Indicators",
  pathName: "loading-indicators",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      LoadingIndicators,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
