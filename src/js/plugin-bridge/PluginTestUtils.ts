import PluginSDK from "PluginSDK";
import Loader from "./Loader";

let _plugins = {};

const pluginsList = require("#PLUGINS");

function __getAvailablePlugins() {
  return {
    pluginsList: _plugins
  };
}

function __setMockPlugins(plugins) {
  _plugins = {};
  Object.keys(plugins).forEach(pluginID => {
    _plugins[pluginID] = plugins[pluginID];
  });
}

// Add custom methods for testing
Loader.__setMockPlugins = __setMockPlugins;

// Rewire so PluginSDK loads the mocked version. But still provide access
// to original method for PluginTestUtils to load actual plugins
Loader.__getAvailablePlugins = () => ({
  pluginsList
});

Loader.getAvailablePlugins = __getAvailablePlugins;

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

  Loader.__setMockPlugins(availablePlugins);
  PluginSDK.initialize(pluginConfig);
}

/**
 * Finds actual plugins by name and loads them
 * @param  {Object} plugins - Map of name to config
 */
function loadPluginsByName(plugins) {
  const pluginsToLoad = {};

  const { pluginsList } = Loader.__getAvailablePlugins();

  Object.keys(plugins).forEach(pluginID => {
    if (!(pluginID in pluginsList)) {
      throw new Error(`${pluginID} does not exist. Failed to load.`);
    }

    pluginsToLoad[pluginID] = {
      module: pluginsList[pluginID],
      config: plugins[pluginID]
    };
  });
  loadPlugins(pluginsToLoad);
}

/**
 * Finds and returns the SDK for a specific plugin
 * @param  {String} pluginID - ID of plugin
 * @param  {Object} config   - configuration
 * @param  {Boolean} loadPlugin
 * @return {PluginSDK}          - SDK for plugin with pluginID
 */
function getSDK(pluginID, config, loadPlugin = false) {
  // Load plugin first so it can register it's reducer
  // if it has one.
  if (loadPlugin) {
    loadPluginsByName({ [pluginID]: config });
  }

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
  loadPlugins,
  loadPluginsByName
};

export default TestUtils;
