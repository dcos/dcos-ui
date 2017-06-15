import Util from "./Util";

// SDK sets/reads this property within package config.
const BETA_OPTIN_PROPERTY_NAME = "beta-optin";
const DOT_NOTATION_SCHEMA_PATH = "properties.service.properties.beta-optin";

const BetaOptInUtil = {
  /**
   * Finds beta-optin property within cosmos package config schema.
   *
   * @param  {Object} configSchema - cosmos package config schema
   * @return {Boolean} Returns true if configSchema contains beta-optin property
   */
  isBeta(configSchema) {
    return BetaOptInUtil.getProperty(configSchema) != null;
  },

  /**
   * Get beta-optin property within config Object
   *
   * @param  {Object} configSchema - cosmos package config schema
   * @return {Object} Returns property if found or null.
   */
  getProperty(configSchema) {
    if (!Util.isObject(configSchema)) {
      return null;
    }

    return Util.findNestedPropertyInObject(
      configSchema,
      DOT_NOTATION_SCHEMA_PATH
    );
  },

  /**
   * Removes beta-optin property within config schema
   *
   * @param  {Object} configSchema - cosmos package config schema
   * @return {Object} Returns new config Object without opt-in property
   */
  filterProperty(configSchema) {
    if (!BetaOptInUtil.isBeta(configSchema)) {
      return configSchema;
    }

    const filteredConfig = Util.deepCopy(configSchema);
    const service = filteredConfig["properties"]["service"];

    // Filter out required property as this will cause validation
    // errors in the schema form if we remove the beta-optin schema Object
    if (Array.isArray(service.required)) {
      service.required = service.required.filter(function(key) {
        return key !== BETA_OPTIN_PROPERTY_NAME;
      });
    }
    delete service["properties"][BETA_OPTIN_PROPERTY_NAME];

    return filteredConfig;
  },

  /**
   * Inserts beta-optin property at path within config model
   *
   * @param  {Object} config - cosmos package config model
   * @return {Object} Returns new cosmos package config with beta
   * opt-in property set to true
   */
  setBetaOptIn(config) {
    if (!Util.isObject(config)) {
      return config;
    }

    const betaConfig = Util.deepCopy(config);

    if (!Util.isObject(betaConfig["service"])) {
      betaConfig["service"] = {};
    }

    betaConfig["service"][BETA_OPTIN_PROPERTY_NAME] = true;

    return betaConfig;
  }
};

module.exports = BetaOptInUtil;
