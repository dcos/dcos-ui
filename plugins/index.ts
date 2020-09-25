import authentication from "./auth";
import banner from "./banner/index";
import oauth from "./oauth/index";
import uiUpdate from "./ui-update/index";

export default {
  "auth-providers": require("./auth-providers/index"),
  "bootstrap-config": require("./bootstrap-config/index"),
  "cluster-linking": require("./cluster-linking/index"),
  "external-links": require("./external-links/index"),
  "sdk-services": require("./sdk-services/index"),
  "ui-update": uiUpdate,
  "ui-update-private": require("./ui-update-private/index"),
  authentication,
  banner,
  branding: require("./branding/index"),
  dss: require("./dss/index"),
  licensing: require("./licensing/index"),
  networking: require("./networking/index"),
  oauth,
  organization: require("./organization/index"),
  placement: require("./placement/index"),
  secrets: require("./secrets/index"),
};
