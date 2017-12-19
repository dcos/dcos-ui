import PluginHooks from "./hooks";

module.exports = function(PluginSDK) {
  const { Hooks, config } = PluginSDK;

  console.log(config);
  PluginHooks.initialize(Hooks);
};
