// Configuration overrides

var ConfigDev = {
  analyticsKey: '39uhSEOoRHMw6cMR6st9tYXDbAL3JSaP',
  rootUrl: '',
  historyServer: '',
  // Override cluster's uiConfiguration for development
  uiConfigurationFixture: {
    uiConfiguration: {
      plugins: {
        banner: {
          enabled: false
        },
        oauth: {
          enabled: false,
          authHost: 'https://dcos.auth0.com'
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
  // Use fixtures to mock API requests
  useFixtures: false,
  // Use uiConfigurationFixture defined above
  useUIConfigFixtures: true
};

module.exports = ConfigDev;
