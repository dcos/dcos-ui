import PluginHooks from "./hooks";

module.exports = function(PluginSDK) {
  const { Hooks } = PluginSDK;

  PluginHooks.initialize(Hooks);
};
