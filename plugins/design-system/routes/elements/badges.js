import { navigation, routing } from "foundation-ui";

import BadgesPage from "../../pages/elements/badges/BadgesPage";

import OverviewTab from "../../pages/elements/badges/tabs/OverviewTab";
import CodeTab from "../../pages/elements/badges/tabs/CodeTab";
import StylesTab from "../../pages/elements/badges/tabs/StylesTab";

module.exports = {
  name: "badges",
  tabs: ["overview", "code", "styles"],
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.name,
      "Badges"
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.name}`,
      BadgesPage
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
