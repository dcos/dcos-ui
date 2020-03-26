import { Hooks } from "PluginSDK";

document.title = "Mesosphere DC/OS Enterprise";

module.exports = {
  filters: ["applicationConfiguration"],

  initialize() {
    this.filters.forEach((filter) => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  applicationConfiguration(configuration) {
    configuration.fullProductName = "Mesosphere DC/OS Enterprise";
    configuration.productName = "Mesosphere DC/OS Enterprise";

    return configuration;
  },
};
