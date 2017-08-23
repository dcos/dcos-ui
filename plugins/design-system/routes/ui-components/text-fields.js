import { navigation, routing } from "foundation-ui";

import TextFields from "../../pages/ui-components/TextFields";

module.exports = {
  title: "Text Fields",
  pathName: "text-fields",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      TextFields,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
