import { MountService } from "foundation-ui";
import { EDIT } from "#PLUGINS/services/src/js/constants/ServiceActionItem";
import SDKServiceEdit from "./components/SDKServiceEdit";

const SDK = require("./SDK");

module.exports = {
  filters: ["isEnabledSDKAction"],

  initialize() {
    MountService.MountService.registerComponent(
      SDKServiceEdit,
      "ServiceEditMessage:Modal"
    );

    this.filters.forEach(filter => {
      SDK.getSDK().Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  isEnabledSDKAction(actionID) {
    return actionID === EDIT;
  }
};
