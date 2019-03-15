import SDK from "./SDK";

export default function(PluginSDK) {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");
  // Set plugin's hooks
  PluginHooks.initialize();
}
