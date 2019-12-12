const pluginsList = require("#PLUGINS/index");

// Try loading the list of plugins.
let externalPluginsList;
try {
  externalPluginsList = require("#EXTERNAL_PLUGINS/index");
} catch (err) {
  externalPluginsList = {};
}

export default {
  getAvailablePlugins: () => ({
    pluginsList,
    externalPluginsList
  })
};
