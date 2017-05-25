import { navigation, routing } from "foundation-ui";

import BannersPage from "../../pages/elements/banners/BannersPage";

import OverviewTab from "../../pages/elements/banners/tabs/OverviewTab";
import CodeTab from "../../pages/elements/banners/tabs/CodeTab";
import StylesTab from "../../pages/elements/banners/tabs/StylesTab";

module.exports = {
  name: "banners",
  tabs: ["overview", "code", "styles"],
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.name,
      "Banners"
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.name}`,
      BannersPage
    );

    // The following calls to #registerTab define child routes for each page.
    // We provide the parent route, the child route, and the component to be
    // rendered.
    routing.RoutingService.registerTab(
      `/ds-components/${this.name}`,
      this.tabs[0],
      OverviewTab
    );

    routing.RoutingService.registerTab(
      `/ds-components/${this.name}`,
      this.tabs[1],
      CodeTab
    );

    routing.RoutingService.registerTab(
      `/ds-components/${this.name}`,
      this.tabs[2],
      StylesTab
    );

    // Redirects should be rendered after all of the associated routes have been
    // defined.
    routing.RoutingService.registerRedirect(
      `/ds-components/${this.name}`,
      `/ds-components/${this.name}/${this.tabs[0]}`
    );
  }
};
