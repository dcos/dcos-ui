let SDK;

module.exports = {
  getSDK: function () {
    return SDK;
  },
  setSDK: function (pluginSDK) {
    SDK = pluginSDK;
  }
};
