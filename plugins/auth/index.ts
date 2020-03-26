import AuthenticationReducer from "./Reducer";

export default (SDK) => {
  const PluginHooks = require("./hooks").default;

  PluginHooks(SDK).initialize();

  return AuthenticationReducer;
};
