import PluginSDK from "PluginSDK";
import Loader from "./Loader";

let _plugins = {};
// Add custom methods for testing
const __setMockPlugins = plugins => {
  _plugins = {};
  Object.keys(plugins).forEach(pluginID => {
    _plugins[pluginID] = plugins[pluginID];
  });
};

Loader.getAvailablePlugins = () => ({ pluginsList: _plugins });

/**
 * Loads whatever plugins are passed in. Could be Mocks
 * @param  {Object} plugins - Plugin name to Config
 */
function loadPlugins(plugins) {
  const availablePlugins = {};
  const pluginConfig = {};

  Object.keys(plugins).forEach(pluginID => {
    availablePlugins[pluginID] = plugins[pluginID].module;
    pluginConfig[pluginID] = plugins[pluginID].config;
  });

  __setMockPlugins(availablePlugins);
  PluginSDK.initialize(pluginConfig);
}

/**
 * Finds and returns the SDK for a specific plugin
 * @param  {String} pluginID - ID of plugin
 * @param  {Object} config   - configuration
 * @param  {Boolean} loadPlugin
 * @return {PluginSDK}          - SDK for plugin with pluginID
 */
function getSDK(pluginID, config) {
  // Get SDK for pluginID.
  return PluginSDK.__getSDK(pluginID, config);
}

/**
 * Add reducer to Store. Could be an actual plugin reducer or a mock for test
 * cases that require specific state.
 * @param {String} root    - Root key for which reducer will manage state
 * @param {Function} reducer - Reducer function
 */
function addReducer(root, reducer) {
  PluginSDK.__addReducer(root, reducer);
}

const TestUtils = {
  addReducer,
  getSDK,
  loadPlugins
};

export default TestUtils;
