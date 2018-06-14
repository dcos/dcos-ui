const enterprise = true;
const oauth = !enterprise && true;

const config = {
  analyticsKey: "39uhSEOoRHMw6cMR6st9tYXDbAL3JSaP",
  rootUrl: "",
  historyServer: "",
  uiConfigurationFixture: {
    uiConfiguration: {
      enableDevTools: true,
      plugins: {
        dss: {
          enabled: true
        },
        "auth-providers": {
          enabled: enterprise
        },
        authentication: {
          enabled: enterprise
        },
        banner: {
          enabled: false
        },
        branding: {
          enabled: enterprise
        },
        "external-links": {
          enabled: enterprise
        },
        licensing: {
          enabled: enterprise
        },
        "sdk-services": {
          enabled: enterprise
        },
        networking: {
          enabled: enterprise,
          dcosLBPackageName: "dcos-lb"
        },
        oauth: {
          enabled: oauth,
          authHost: "https://dcos.auth0.com"
        },
        organization: {
          enabled: enterprise
        },
        secrets: {
          enabled: enterprise
        },
        tracking: {
          enabled: false
        },
        placement: {
          enabled: enterprise
        },
        inspector: {
          enabled: enterprise
        }
      }
    },
    clusterConfiguration: {
      firstUser: true,
      id: "ui-fixture-cluster-id"
    }
  },
  useFixtures: false,
  useUIConfigFixtures: true
};

module.exports = config;
