import { navigation, routing } from "foundation-ui";

import BreadcrumbsPage from "../../pages/elements/breadcrumbs/BreadcrumbsPage";

import OverviewTab from "../../pages/elements/breadcrumbs/tabs/OverviewTab";
import CodeTab from "../../pages/elements/breadcrumbs/tabs/CodeTab";
import StylesTab from "../../pages/elements/breadcrumbs/tabs/StylesTab";

module.exports = {
  name: "breadcrumbs",
  tabs: ["overview", "code", "styles"],
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.name,
      "Breadcrumbs"
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.name}`,
      BreadcrumbsPage
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
