import SDK from "./SDK";

export default PluginSDK => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");

  PluginHooks.initialize(PluginSDK.config);
};
