import banner from "./banner/index";
import tracking from "./tracking/index";
import oauth from "./oauth/index";
import intercom from "./intercom/index";
import uiUpdate from "./ui-update/index";

export default {
  "auth-providers": require("./auth-providers/index"),
  "bootstrap-config": require("./bootstrap-config/index"),
  "cluster-linking": require("./cluster-linking/index"),
  "external-links": require("./external-links/index"),
  "intercom-private": require("./intercom-private/index"),
  "sdk-services": require("./sdk-services/index"),
  "ui-update": uiUpdate,
  "ui-update-private": require("./ui-update-private/index"),
  authentication: require("./auth/index"),
  banner,
  branding: require("./branding/index"),
  dss: require("./dss/index"),
  intercom,
  licensing: require("./licensing/index"),
  networking: require("./networking/index"),
  oauth,
  organization: require("./organization/index"),
  placement: require("./placement/index"),
  secrets: require("./secrets/index"),
  tracking
};
