let pluginsList;
let externalPluginsList;

// Try loading the list of plugins.
try {
  pluginsList = require("#PLUGINS/index").default;
} catch (err) {
  // No plugins
  pluginsList = {};
}

// Try loading the list of plugins.
try {
  externalPluginsList = require("#EXTERNAL_PLUGINS/index");
} catch (err) {
  externalPluginsList = {};
}

// Return all available plugins
function getAvailablePlugins() {
  return {
    pluginsList,
    externalPluginsList
  };
}

export default {
  getAvailablePlugins
};