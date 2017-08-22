import { navigation, routing } from "foundation-ui";

import ComponentPage from "../../pages/ComponentPage";

import OverviewTab from "../../pages/ui-components/banners/tabs/OverviewTab";
import CodeTab from "../../pages/ui-components/banners/tabs/CodeTab";
import StylesTab from "../../pages/ui-components/banners/tabs/StylesTab";

module.exports = {
  title: "Banners",
  pathName: "banners",
  tabs: ["overview", "code", "styles"],
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.pathName,
      this.title
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.pathName}`,
      ComponentPage,
      {
        title: this.title,
        pathName: this.pathName
      }
    );

    // The following calls to #registerTab define child routes for each page.
    // We provide the parent route, the child route, and the component to be
    // rendered.
    routing.RoutingService.registerTab(
      `/ds-components/${this.pathName}`,
      this.tabs[0],
      OverviewTab
    );

    routing.RoutingService.registerTab(
      `/ds-components/${this.pathName}`,
      this.tabs[1],
      CodeTab
    );

    routing.RoutingService.registerTab(
      `/ds-components/${this.pathName}`,
      this.tabs[2],
      StylesTab
    );

    // Redirects should be rendered after all of the associated routes have been
    // defined.
    routing.RoutingService.registerRedirect(
      `/ds-components/${this.pathName}`,
      `/ds-components/${this.pathName}/${this.tabs[0]}`
    );
  }
};
