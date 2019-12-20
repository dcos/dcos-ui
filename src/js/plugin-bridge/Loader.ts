import pluginsList from "#PLUGINS";

let externalPluginsList;

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
