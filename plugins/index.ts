import banner from "./banner/index";
import tracking from "./tracking/index";
import oauth from "./oauth/index";
import intercom from "./intercom/index";
import uiUpdate from "./ui-update/index";

export default {
  authentication: require("./auth/index"),
  "auth-providers": require("./auth-providers/index"),
  "bootstrap-config": require("./bootstrap-config/index"),
  branding: require("./branding/index"),
  "cluster-linking": require("./cluster-linking/index"),
  dss: require("./dss/index"),
  "external-links": require("./external-links/index"),
  "intercom-private": require("./intercom-private/index"),
  licensing: require("./licensing/index"),
  networking: require("./networking/index"),
  organization: require("./organization/index"),
  placement: require("./placement/index"),
  secrets: require("./secrets/index"),
  "sdk-services": require("./sdk-services/index"),
  "ui-update-private": require("./ui-update-private/index"),
  banner,
  tracking,
  oauth,
  intercom,
  "ui-update": uiUpdate
};
