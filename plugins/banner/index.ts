import SDK from "./SDK";

export default PluginSDK => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks").default;
  // Set plugin's hooks
  PluginHooks.initialize();
};
