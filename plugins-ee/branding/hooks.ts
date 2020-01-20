const SDK = require("./SDK");

document.title = "Mesosphere DC/OS Enterprise";

module.exports = {
  filters: ["applicationConfiguration"],

  initialize() {
    this.filters.forEach(filter => {
      SDK.getSDK().Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  applicationConfiguration(configuration) {
    configuration.fullProductName = "Mesosphere DC/OS Enterprise";
    configuration.productName = "Mesosphere DC/OS Enterprise";

    return configuration;
  }
};
