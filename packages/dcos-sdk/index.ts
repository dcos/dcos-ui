import { ContainerModule } from "inversify";
import { bindExtensionProvider } from "plugin-baby";

import NavigationService, {
  NavigationServiceExtension,
  INavigationExtension
} from "./src/NavigationService";
import RoutingService, {
  RoutingServiceExtension,
  IRoutingExtension
} from "./src/RoutingService";

export {
  INavigationExtension,
  NavigationService,
  NavigationServiceExtension,
  IRoutingExtension,
  RoutingService,
  RoutingServiceExtension
};

export default new ContainerModule((bind, _unbind) => {
  bind("RoutingService").to(RoutingService).inSingletonScope();
  bind("NavigationService").to(NavigationService).inSingletonScope();

  bindExtensionProvider(bind, RoutingServiceExtension);
  bindExtensionProvider(bind, NavigationServiceExtension);
});
