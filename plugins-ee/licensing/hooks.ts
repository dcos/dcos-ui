import { MountService } from "foundation-ui";
import LicensingBanner from "./components/LicensingBanner";
import LicensingNodeCapacityRow from "./components/LicensingNodeCapacityRow";
import LicensingExpirationRow from "./components/LicensingExpirationRow";
import { getSDK } from "./SDK";

const SDK = getSDK();
const { Hooks } = SDK;

module.exports = {
  actions: ["userCapabilitiesFetched"],

  initialize() {
    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });
  },

  userCapabilitiesFetched() {
    // Don't register the licensing components when not superadmin
    if (!Hooks.applyFilter("hasCapability", false, "superadmin")) {
      return;
    }

    MountService.MountService.registerComponent(
      LicensingBanner,
      "Page:TopBanner"
    );
    MountService.MountService.registerComponent(
      LicensingNodeCapacityRow,
      "OverviewDetailTab:AdditionalGeneralDetails:Nodes"
    );
    MountService.MountService.registerComponent(
      LicensingExpirationRow,
      "OverviewDetailTab:AdditionalGeneralDetails:Date"
    );
  }
};
