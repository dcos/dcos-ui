import PluginSDK from "PluginSDK";
import JestUtil from "../utils/JestUtil";
import Loader from "./Loader";
import PluginModules from "./PluginModules";

/**
 * Loads whatever plugins are passed in. Could be Mocks
 * @param  {Object} plugins - Plugin name to Config
 */
function loadPlugins(plugins) {
  var availablePlugins = {};
  var pluginConfig = {};

  Object.keys(plugins).forEach(function(pluginID) {
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

  const { pluginsList, externalPluginsList } = Loader.__getAvailablePlugins();

  Object.keys(plugins).forEach(function(pluginID) {
    if (!(pluginID in pluginsList) && !(pluginID in externalPluginsList)) {
      throw new Error(`${pluginID} does not exist. Failed to load.`);
    }
    let path;
    // Default to always selecting internal plugin if same pluginID
    // exists in external plugins. This makes mocking easier.
    if (pluginID in pluginsList) {
      path = pluginsList[pluginID];
    } else {
      path = externalPluginsList[pluginID];
    }
    pluginsToLoad[pluginID] = {
      module: path,
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
    loadPluginsByName({
      [pluginID]: config
    });
  }

  // Get SDK for pluginID.
  return PluginSDK.__getSDK(pluginID, config);
}

/**
 * Set a mock for a module which would normally be returned by
 * PluginSDK.get().
 * @param {String} name - name of module
 * @param {any} mock - value representing the mock
 * @returns {mock} - the mock that was passed in
 */
function setMock(name, mock) {
  Loader.__setMockModule(name, mock);

  return mock;
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

/**
 * Takes an Array or String representing a module name{s) that need unMocking,
 * finds the directory of the file and calls jest.dontMock on path.
 * @param  {Array|String} moduleNames - Names of modules to dontMock

 */
function dontMock(moduleNames) {
  if (Array.isArray(moduleNames)) {
    moduleNames.forEach(dontMock);

    return;
  }
  // Just one module to mock
  var name = moduleNames;
  // Try unmocking store first
  if (JestUtil.dontMockStore(name)) {
    return;
  }
  // Assuming modules have unique names
  const foundType = Object.keys(PluginModules).filter(moduleType => {
    return name in PluginModules[moduleType];
  });
  if (!foundType.length) {
    throw new Error(`Module ${name} does not exist.`);
  }
  const modulePath = `../${foundType[0]}/${PluginModules[foundType[0]][name]}`;
  jest.dontMock(modulePath);
}

const TestUtils = {
  addReducer,
  getSDK,
  dontMock,
  loadPlugins,
  loadPluginsByName,
  setMock
};

module.exports = TestUtils;
