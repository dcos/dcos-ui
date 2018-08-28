// Configuration overrides

export default {
  analyticsKey: "39uhSEOoRHMw6cMR6st9tYXDbAL3JSaP",
  rootUrl: "",
  historyServer: "",
  // Override cluster's uiConfiguration for development
  uiConfigurationFixture: {
    uiConfiguration: {
      plugins: {
        banner: {
          enabled: false
        },
        intercom: {
          enabled: true,
          appId: "wn4z9z0y"
        },
        mesos: {
          "logging-strategy": "logrotate"
        },
        oauth: {
          enabled: true,
          authHost: "https://dcos.auth0.com"
        },
        "overview-detail": {
          enabled: true
        },
        tracking: {
          enabled: true
        }
      }
    },
    clusterConfiguration: {
      firstUser: true,
      id: "ui-fixture-cluster-id"
    }
  },
  // Use fixtures to mock API requests
  useFixtures: false,
  // Use uiConfigurationFixture defined above
  useUIConfigFixtures: false
};
