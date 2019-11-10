import SDK from "./SDK";

module.exports = PluginSDK => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");
  // Set plugin's hooks
  PluginHooks.initialize();
};
