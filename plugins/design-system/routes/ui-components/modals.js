import { navigation, routing } from "foundation-ui";

import ModalsPage from "../../pages/ui-components/modals/ModalsPage";

import OverviewTab from "../../pages/ui-components/modals/tabs/OverviewTab";
import CodeTab from "../../pages/ui-components/modals/tabs/CodeTab";
import StylesTab from "../../pages/ui-components/modals/tabs/StylesTab";

module.exports = {
  name: "modals",
  tabs: ["overview", "code", "styles"],
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.name,
      "Modals"
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.name}`,
      ModalsPage
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
