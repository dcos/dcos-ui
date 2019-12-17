import SDK from "./SDK";

export default PluginSDK => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks").default;

  PluginHooks.initialize(PluginSDK.config);
};
