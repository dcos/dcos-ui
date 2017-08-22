import { navigation, routing } from "foundation-ui";

import SegmentedBars from "../../pages/ui-components/SegmentedBars";

module.exports = {
  title: "Segmented Bars",
  pathName: "segmented-bars",
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      SegmentedBars,
      {
        title: this.title,
        pathName: this.pathName
      }
    );
  }
};
