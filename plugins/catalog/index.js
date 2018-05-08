import * as inversify from "inversify";
import { RoutingServiceExtension, NavigationServiceExtension } from "dcos-sdk";

import RepositoriesRouting from "./src/js/repositories/RepositoriesRouting";
import CatalogRouting from "./src/js/catalog/CatalogRouting";
import RepositoriesNavigation
  from "./src/js/repositories/RepositoriesNavigation";
import CatalogNavigation from "./src/js/catalog/CatalogNavigation";

// Common interface. It will be used to dynamically parameterize modules.
// Think of a framework specific views
export default function moduleFactory(_context = {}) {
  return new inversify.ContainerModule(bind => {
    bind(RoutingServiceExtension).to(RepositoriesRouting).inSingletonScope();
    bind(NavigationServiceExtension)
      .to(RepositoriesNavigation)
      .inSingletonScope();
    bind(RoutingServiceExtension).to(CatalogRouting).inSingletonScope();
    bind(NavigationServiceExtension).to(CatalogNavigation).inSingletonScope();
  });
}
