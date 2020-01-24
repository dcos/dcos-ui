import pluginsList from "#PLUGINS";

const externalPluginsList = {};

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
