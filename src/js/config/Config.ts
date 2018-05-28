/* eslint no-redeclare: 0 */

import ConfigDev from "./Config.dev";
import ConfigTest from "./Config.test";

interface Configuration {
  acsAPIPrefix: string
  analyticsKey: string
  applicationRenderDelay: number
  cosmosAPIPrefix: string
  delayAfterErrorCount: number
  documentationURI: string
  downloadsURI: string
  environment?: string,
  fullProductName: string
  getRefreshRate: () => number
  historyLength: number
  historyServer: string
  logsAPIPrefix: string
  marathonAPIPrefix: string
  mesosDocsURI: string
  metronomeAPI: string
  networkingAPIPrefix: string
  productHomepageURI: string
  productName: string
  rootUrl: string
  secretsAPIPrefix: string
  setInactiveAfter: number
  slackChannel: string
  stateRefresh: number
  supportEmail: string
  tailRefresh: number
  testHistoryInterval: number
  unitHealthAPIPrefix: string
  useFixtures?: boolean
  version: string
  virtualNetworksApi: string
}

let Config: Configuration = {
  analyticsKey: "51ybGTeFEFU1xo6u10XMDrr6kATFyRyh",
  acsAPIPrefix: "/acs/api/v1",
  applicationRenderDelay: 1000,
  networkingAPIPrefix: "/networking/api/v1",
  cosmosAPIPrefix: "/package",
  secretsAPIPrefix: "/secrets/v1",
  delayAfterErrorCount: 5,
  documentationURI: "https://docs.mesosphere.com",
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
  setInactiveAfter: 30000,
  testHistoryInterval: 10000,
  rootUrl: "",
  slackChannel: "https://dcos-community.slack.com/messages/general/",
  stateRefresh: 2000,
  supportEmail: "help@dcos.io",
  tailRefresh: 10000,
  unitHealthAPIPrefix: "/system/health/v1",
  logsAPIPrefix: "/system/v1/agent",
  version: "@@VERSION",
  virtualNetworksApi: "/mesos/overlay-master",
  getRefreshRate: function() {
    return this.stateRefresh;
  }
};

if (Config.environment === "development") {
  Config.analyticsKey = ""; // Safeguard from developers logging to prod
  Config = Object.assign(Config, ConfigDev);
} else if (Config.environment === "testing") {
  Config.analyticsKey = ""; // Safeguard from developers logging to prod
  Config = Object.assign(Config, ConfigTest);
} else if (Config.environment === "production") {
  Config.useFixtures = false;
}

export default Config;
