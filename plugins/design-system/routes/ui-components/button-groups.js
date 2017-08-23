import { navigation, routing } from "foundation-ui";

import ButtonGroups from "../../pages/ui-components/ButtonGroups";

module.exports = {
  title: "Button Groups",
  pathName: "button-groups",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      ButtonGroups,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
