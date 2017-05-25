import { navigation, routing } from "foundation-ui";

import CheckboxesPage from "../../pages/elements/checkboxes/CheckboxesPage";

import OverviewTab from "../../pages/elements/checkboxes/tabs/OverviewTab";
import CodeTab from "../../pages/elements/checkboxes/tabs/CodeTab";
import StylesTab from "../../pages/elements/checkboxes/tabs/StylesTab";

module.exports = {
  name: "checkboxes",
  tabs: ["overview", "code", "styles"],
  addRoutes() {
    navigation.NavigationService.registerSecondary(
      "/ds-components",
      this.name,
      "Checkboxes"
    );

    routing.RoutingService.registerPage(
      `/ds-components/${this.name}`,
      CheckboxesPage
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
