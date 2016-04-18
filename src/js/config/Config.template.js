// Configuration overrides

var enterprise = true;

var ConfigDev = {
  analyticsKey: '39uhSEOoRHMw6cMR6st9tYXDbAL3JSaP',
  rootUrl: 'http://dcos.local',
  historyServer: 'http://dcos.local',
  uiConfigurationFixture: {
    uiConfiguration: {
      plugins: {
        authentication: {
          enabled: enterprise
        },
        banner: {
          enabled: false
        },
        branding: {
          enabled: enterprise
        },
        'external-links': {
          enabled: enterprise
        },
        networking: {
          enabled: enterprise
        },
        oauth: {
          enabled: false,
          authHost: 'https://dcos.auth0.com'
        },
        organization: {
          enabled: enterprise
        },
        'overview-detail': {
          enabled: true
        },
        tracking: {
          enabled: true
        }
      }
    },
    clusterConfiguration: {
      firstUser: true,
      id: 'ui-fixture-cluster-id'
    }
  },
  useFixtures: false,
  useUIConfigFixtures: false
};

module.exports = ConfigDev;
