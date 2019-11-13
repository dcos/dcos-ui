import SDK from "./SDK";

export default PluginSDK => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");
  const TrackingActions = require("./actions/Actions");
  // Set plugin's hooks
  PluginHooks.initialize(PluginSDK.config);

  // Register Actions
  PluginSDK.registerActions(TrackingActions);
};
