import SDK from "./SDK";

module.exports = PluginSDK => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");
  const SecretsReducer = require("./Reducer");
  // Set plugin's hooks
  PluginHooks.initialize();

  return SecretsReducer;
};
