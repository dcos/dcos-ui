/* eslint no-redeclare: 0 */
var _ = require('underscore');
var ConfigDev = require('./Config.dev.js');
var ConfigTest = require('./Config.test.js');

var Config = {
  analyticsKey: '@@ANALYTICS_KEY',
  acsAPIPrefix: '/acs/api/v1',
  networkingAPIPrefix: '/networking/api/v1',
  cosmosAPIPrefix: '/package',
  delayAfterErrorCount: 5,
  documentationURI: 'https://dcos.io/docs',
  downloadsURI: 'https://downloads.dcos.io',
  environment: '@@ENV',
  historyLength: 31,
  historyServer: '',
  fullProductName: 'DC/OS',
  productName: 'DC/OS',
  productHomepageURI: 'https://dcos.io',
  setInactiveAfter: 30000,
  rootUrl: '',
  stateLoadDelay: 1000,
  slackChannel: 'https://dcos-community.slack.com/messages/general/',
  stateRefresh: 2000,
  supportEmail: 'help@dcos.io',
  tailRefresh: 10000,
  unitHealthAPIPrefix: '/system/health/v1',
  version: '@@VERSION'
};

Config.getRefreshRate = function () {
  return this.stateRefresh;
};

// @@ENV gets replaced by Broccoli
if (Config.environment === 'development') {
  Config.analyticsKey = ''; // Safeguard from developers logging to prod
  Config = _.extend(Config, ConfigDev);
} else if (Config.environment === 'testing') {
  Config.analyticsKey = ''; // Safeguard from developers logging to prod
  Config = _.extend(Config, ConfigTest);
} else if (Config.environment === 'production') {
  Config.useFixtures = false;
}

Config.setOverrides = function (overrides) {
  this.rootUrl = overrides.rootUrl || this.rootUrl;
  this.historyServer = overrides.historyServer || this.historyServer;
};

module.exports = Config;
