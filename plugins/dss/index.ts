import PluginHooks from "./hooks";
import SDK from "./SDK";

module.exports = (PluginSDK) => {
  const { Hooks } = PluginSDK;
  SDK.setSDK(PluginSDK);

  PluginHooks.initialize(Hooks);
};
