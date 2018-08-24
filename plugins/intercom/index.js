import SDK from "./SDK";

module.exports = function(PluginSDK) {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");

  PluginHooks.initialize(PluginSDK.config);
};
