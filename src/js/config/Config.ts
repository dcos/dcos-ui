/* eslint no-redeclare: 0 */

import ConfigDev from "./Config.dev";
import ConfigTest from "./Config.test";
import UserSettingsStore from "#SRC/js/stores/UserSettingsStore";

interface IConfiguration {
  acsAPIPrefix: string;
  analyticsKey: string;
  cosmosAPIPrefix: string;
  delayAfterErrorCount: number;
  supportPortalURI: string;
  downloadsURI: string;
  environment?: string;
  fullProductName: string;
  getRefreshRate: () => number;
  getLongPollingInterval: () => number;
  historyLength: number;
  historyServer: string;
  logsAPIPrefix: string;
  marathonAPIPrefix: string;
  mesosDocsURI: string;
  metronomeAPI: string;
  networkingAPIPrefix: string;
  productHomepageURI: string;
  productName: string;
  rootUrl: string;
  secretsAPIPrefix: string;
  slackChannel: string;
  defaultRefreshRate: number;
  stateLongPoll: number;
  supportEmail: string;
  tailRefresh: number;
  uiConfigurationFixture?: object;
  useUIConfigFixtures?: boolean;
  unitHealthAPIPrefix: string;
  useFixtures?: boolean;
  version: string;
}

let Config: IConfiguration = {
  analyticsKey: "51ybGTeFEFU1xo6u10XMDrr6kATFyRyh",
  acsAPIPrefix: "/acs/api/v1",
  networkingAPIPrefix: "/networking/api/v1",
  cosmosAPIPrefix: "/package",
  secretsAPIPrefix: "/secrets/v1",
  delayAfterErrorCount: 5,
  supportPortalURI: "https://support.mesosphere.com",
  mesosDocsURI: "https://mesos.apache.org/documentation/latest/",
  downloadsURI: "https://downloads.dcos.io",
  environment: process.env.NODE_ENV,
  historyLength: 31,
  historyServer: "",
  fullProductName: "Mesosphere DC/OS",
  marathonAPIPrefix: "/service/marathon/v2",
  metronomeAPI: "/service/metronome",
  productName: "Mesosphere DC/OS",
  productHomepageURI: "https://dcos.io",
  rootUrl: "",
  slackChannel: "https://dcos-community.slack.com/messages/general/",
  defaultRefreshRate: 2000,
  stateLongPoll: 300000,
  supportEmail: "help@dcos.io",
  tailRefresh: 10000,
  unitHealthAPIPrefix: "/system/health/v1",
  logsAPIPrefix: "/system/v1/agent",
  version: "@@VERSION",
  getRefreshRate() {
    return UserSettingsStore.RefreshRateSetting === null
      ? this.defaultRefreshRate
      : UserSettingsStore.RefreshRateSetting * 1000;
  },
  getLongPollingInterval() {
    return this.stateLongPoll;
  }
};

if (Config.environment === "development") {
  Config.analyticsKey = ""; // Safeguard from developers logging to prod
  Config = { ...Config, ...ConfigDev };
} else if (Config.environment === "testing") {
  Config.analyticsKey = ""; // Safeguard from developers logging to prod
  Config = { ...Config, ...ConfigTest };
} else if (Config.environment === "production") {
  Config.useFixtures = false;
}

// we want to stub requests sometimes.
// as tests bring their own, we never want to stub if cypress is at work.
if (window.Cypress) {
  Config.useFixtures = false;
  Config.useUIConfigFixtures = false;
}

export default Config;
