import { navigation, routing } from "foundation-ui";

import Type from "../../pages/ui-components/Type";

module.exports = {
  title: "Type",
  pathName: "type",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Type,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
