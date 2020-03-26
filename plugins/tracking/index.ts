import SDK from "./SDK";

export default (PluginSDK) => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks").default;
  const TrackingActions = require("./actions/Actions").default;
  // Set plugin's hooks
  PluginHooks.initialize(PluginSDK.config);

  // Register Actions
  PluginSDK.registerActions(TrackingActions);
};
