import * as inversify from "inversify";
import { RoutingServiceExtension, NavigationServiceExtension } from "dcos-sdk";

import LegacyRouting from "./LegacyRouting";
import LegacyNavigation from "./LegacyNavigation";

// Common interface. It will be used to dynamically parameterize modules.
// Think of a framework specific views
export default function moduleFactory(_context = {}) {
  return new inversify.ContainerModule(bind => {
    bind(RoutingServiceExtension).to(LegacyRouting).inSingletonScope();
    bind(NavigationServiceExtension).to(LegacyNavigation).inSingletonScope();
  });
}
