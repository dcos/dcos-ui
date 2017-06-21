import path from "path";

let _plugins = {};
let _externalPlugins = {};

const Plugins = {};
const Mocks = {};

let pluginsList;
let externalPluginsList;
const pluginsDir = "plugins";
const externalPluginsDir = path.resolve(
  process.env.npm_config_externalplugins || "plugins"
);

try {
  pluginsList = require("PLUGINS");
} catch (err) {
  pluginsList = {};
}

try {
  externalPluginsList = require(externalPluginsDir);
} catch (err) {
  externalPluginsList = {};
}

function __getAvailablePlugins() {
  return {
    pluginsList: _plugins,
    externalPluginsList: _externalPlugins
  };
}

function __setMockPlugins(plugins) {
  _plugins = {};
  _externalPlugins = {};
  Object.keys(plugins).forEach(function(pluginID) {
    if (pluginID in externalPluginsList) {
      _externalPlugins[pluginID] = plugins[pluginID];
    } else {
      _plugins[pluginID] = plugins[pluginID];
    }
  });
}

function __setMockModule(name, mock) {
  Mocks[name] = mock;
}

function __requireModule(dir, name) {
  // Return mock for module
  if (name in Mocks) {
    return Mocks[name];
  }

  if (dir === "navigation" || dir === "routing") {
    return require(path.resolve("./foundation-ui", `${dir}/${name}`));
  }

  if (dir === "internalPlugin") {
    return require(path.resolve(pluginsDir, name));
  }

  if (dir === "externalPlugin") {
    return require(path.resolve(externalPluginsDir, name));
  }

  return require(path.resolve("./src/js", `${dir}/${name}`));
}

// Add custom methods for testing
Plugins.__setMockPlugins = __setMockPlugins;

// Rewire so PluginSDK loads the mocked version. But still provide access
// to original method for PluginTestUtils to load actual plugins
Plugins.__getAvailablePlugins = function() {
  return {
    pluginsList,
    externalPluginsList
  };
};

Plugins.getAvailablePlugins = __getAvailablePlugins;
Plugins.requireModule = __requireModule;
Plugins.__setMockModule = __setMockModule;
module.exports = Plugins;
