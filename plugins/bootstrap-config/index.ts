import SDK from "./SDK";

module.exports = (PluginSDK) => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");
  const BootstrapConfigReducer = require("./Reducer");

  // Set plugin's hooks
  PluginHooks.initialize();

  return BootstrapConfigReducer;
};
