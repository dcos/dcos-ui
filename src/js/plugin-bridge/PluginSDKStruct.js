/**
 * Struct representing the PluginSDK
 */
class PluginSDK {
  constructor(item) {
    Object.keys(item).forEach(function(key) {
      this[key] = item[key];
    }, this);
  }
}

module.exports = PluginSDK;
