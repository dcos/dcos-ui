import DCOSStore from "./stores/DCOSStore";
import ResourceTableUtil from "./utils/ResourceTableUtil";
import RoutingService from "./routing";
import NavigationService from "./navigation";
import { MountService } from "./mount";
import Mount from "./mount/Mount";

module.exports = {
  DCOSStore,
  MountService: {
    Mount,
    MountService
  },
  NavigationService,
  ResourceTableUtil,
  RoutingService
};
