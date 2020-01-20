import SDK from "./SDK";

module.exports = PluginSDK => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");
  const AuthenticationReducer = require("./Reducer");

  // Set plugin's hooks
  PluginHooks.initialize();

  return AuthenticationReducer;
};
