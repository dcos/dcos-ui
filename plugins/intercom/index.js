import SDK from "./SDK";

export default function(PluginSDK) {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");

  PluginHooks.initialize(PluginSDK.config);
}
