import { MountService } from "foundation-ui";
import BootstrapConfigHashMap from "./components/BootstrapConfigHashMap";

module.exports = {
  initialize() {
    MountService.MountService.registerComponent(
      BootstrapConfigHashMap,
      "OverviewDetailTab:AdditionalClusterDetails"
    );
  }
};
