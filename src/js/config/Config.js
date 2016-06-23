/* eslint no-redeclare: 0 */
var ConfigDev = require('./Config.dev.js');
var ConfigTest = require('./Config.test.js');

var Config = {
  analyticsKey: '51ybGTeFEFU1xo6u10XMDrr6kATFyRyh',
  acsAPIPrefix: '/acs/api/v1',
  applicationRenderDelay: 1000,
  networkingAPIPrefix: '/networking/api/v1',
  cosmosAPIPrefix: '/package',
  secretsAPIPrefix: '/secrets/v1',
  delayAfterErrorCount: 5,
  documentationURI: 'https://dcos.io/docs',
  downloadsURI: 'https://downloads.dcos.io',
  environment: '@@ENV',
  historyLength: 31,
  historyServer: '',
  fullProductName: 'DC/OS',
  marathonAPIPrefix: '/service/marathon/v2',
  metronomeAPI: '/service/metronome',
  productName: 'DC/OS',
  productHomepageURI: 'https://dcos.io',
  setInactiveAfter: 30000,
  testHistoryInterval: 10000,
  rootUrl: '',
  slackChannel: 'https://dcos-community.slack.com/messages/general/',
  stateRefresh: 2000,
  supportEmail: 'help@dcos.io',
  tailRefresh: 10000,
  unitHealthAPIPrefix: '/system/health/v1',
  version: '@@VERSION',
  virtualNetworksApi: '/mesos/overlay-master'
};

Config.getRefreshRate = function () {
  return this.stateRefresh;
};

// @@ENV gets replaced by Broccoli
if (Config.environment === 'development') {
  Config.analyticsKey = ''; // Safeguard from developers logging to prod
  Config = Object.assign(Config, ConfigDev);
} else if (Config.environment === 'testing') {
  Config.analyticsKey = ''; // Safeguard from developers logging to prod
  Config = Object.assign(Config, ConfigTest);
} else if (Config.environment === 'production') {
  Config.useFixtures = false;
}

Config.setOverrides = function (overrides) {
  this.rootUrl = overrides.rootUrl || this.rootUrl;
  this.historyServer = overrides.historyServer || this.historyServer;
};

module.exports = Config;
