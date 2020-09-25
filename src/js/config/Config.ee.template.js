// Configuration overrides

const enterprise = true;

export default {
  analyticsKey: "39uhSEOoRHMw6cMR6st9tYXDbAL3JSaP",
  rootUrl: "",
  uiConfigurationFixture: {
    uiConfiguration: {
      plugins: {
        "auth-providers": {
          enabled: enterprise,
        },
        authentication: {
          enabled: enterprise,
        },
        banner: {
          enabled: false,
        },
        dss: {
          enabled: enterprise,
        },
        branding: {
          enabled: enterprise,
        },
        "cluster-linking": {
          enabled: enterprise,
        },
        "external-links": {
          enabled: enterprise,
        },
        licensing: {
          enabled: enterprise,
        },
        "sdk-services": {
          enabled: enterprise,
        },
        networking: {
          enabled: enterprise,
          dcosLBPackageName: "dcos-lb",
        },
        oauth: {
          enabled: false,
          authHost: "https://dcos.auth0.com",
        },
        organization: {
          enabled: enterprise,
        },
        secrets: {
          enabled: enterprise,
        },
      },
    },
    clusterConfiguration: {
      firstUser: true,
      id: "ui-fixture-cluster-id",
    },
  },
  useFixtures: false,
  useUIConfigFixtures: false,
};
