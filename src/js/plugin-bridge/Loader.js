// Provide webpack contexts for smarter build. Without these,
// webpack will try to be smart and auto create the contexts,
// doubling the built output
const requirePlugin = require.context("../../../plugins", true, /index/);
const requireConfig = require.context("../config", false);
const requireEvents = require.context("../events", false);
const requireSystemPages = require.context("../pages/system", false);
const requireStores = require.context("../stores", false);
const requireStructs = require.context("../structs", false);
const requireUtils = require.context("../utils", false);
const requireMixins = require.context("../mixins", false);
const requireConstants = require.context("../constants", false);
const requireComponents = require.context("../components", false);
const requireCharts = require.context("../components/charts", false);
const requireIcons = require.context("../components/icons", false);
const requireModals = require.context("../components/modals", false);
const requireForm = require.context("../components/form", false);
// Foundation
const requireRouting = require.context("../../../foundation-ui/routing", false);
const requireNavigation = require.context(
  "../../../foundation-ui/navigation",
  false
);
const requireFoundation = require.context("../../../foundation-ui", false);
let requireExternalPlugin = function() {
  return {};
};
try {
  requireExternalPlugin = require.context("EXTERNAL_PLUGINS", true, /index/);
} catch (err) {}

let pluginsList;
let externalPluginsList;

// Try loading the list of plugins.
try {
  pluginsList = requirePlugin("./index");
} catch (err) {
  // No plugins
  pluginsList = {};
}

// Try loading the list of plugins.
try {
  externalPluginsList = requireExternalPlugin("./index");
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

/**
 * Removes a part of a filepath
 * @param  {Array} dirs    - Array of directories representing the path to a file
 * @param  {Int} atIndex - Index of directory to remove
 * @return {String}         - New path to file
 */
function removeDir(dirs, atIndex) {
  dirs.splice(atIndex, 1);

  return dirs.join("/");
}

/**
 * Finds component within subdirectories of components/
 * @param  {String} path - Path to module
 * @return {module}      - result of require
 */
function pluckComponent(path) {
  const dirs = path.split("/");
  switch (dirs[1]) {
    case "charts":
      return requireCharts(removeDir(dirs, 1));
    case "icons":
      return requireIcons(removeDir(dirs, 1));
    case "modals":
      return requireModals(removeDir(dirs, 1));
    case "form":
      return requireForm(removeDir(dirs, 1));
    default:
      return requireComponents(path);
  }
}

/**
 * Dynamic require of module with base directory and name
 * @param  {String} dir  - base directory of module
 * @param  {String} name - name of module
 * @return {module}      - result of require
 */
function requireModule(dir, name) {
  const path = "./" + name;
  switch (dir) {
    case "config":
      return requireConfig(path);
    case "constants":
      return requireConstants(path);
    case "events":
      return requireEvents(path);
    case "routing":
      return requireRouting(path);
    case "foundation-ui":
      return requireFoundation(path);
    case "systemPages":
      return requireSystemPages(path);
    case "stores":
      return requireStores(path);
    case "structs":
      return requireStructs(path);
    case "utils":
      return requireUtils(path);
    case "mixins":
      return requireMixins(path);
    case "navigation":
      return requireNavigation(path);
    case "components":
      return pluckComponent(path);
    case "externalPlugin":
      return requireExternalPlugin(path);
    case "internalPlugin":
      return requirePlugin(path);
    default:
      throw Error(`No loader for directory: ${dir}`);
  }
}

module.exports = {
  getAvailablePlugins,
  requireModule
};
