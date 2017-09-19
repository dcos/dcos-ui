import { navigation, routing } from "foundation-ui";

import Tooltips from "../../pages/ui-components/Tooltips";

module.exports = {
  title: "Tooltips",
  pathName: "tooltips",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      Tooltips,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
