import { MountService } from "foundation-ui";
import { ServiceActionItem } from "#PLUGINS/services/src/js/constants/ServiceActionItem";
import SDKServiceEdit from "./components/SDKServiceEdit";
import { Hooks } from "PluginSDK";

module.exports = {
  filters: ["isEnabledSDKAction"],

  initialize() {
    MountService.MountService.registerComponent(
      SDKServiceEdit,
      "ServiceEditMessage:Modal"
    );

    this.filters.forEach(filter => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  isEnabledSDKAction(actionID) {
    return actionID === ServiceActionItem.EDIT;
  }
};
