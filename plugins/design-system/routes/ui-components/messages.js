import { navigation, routing } from "foundation-ui";

import Messages from "../../pages/ui-components/Messages";

module.exports = {
  title: "Messages",
  pathName: "messages",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Messages,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
