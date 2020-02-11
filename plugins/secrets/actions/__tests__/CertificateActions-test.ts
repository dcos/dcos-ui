import CertificateActions from "../CertificateActions";

import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration, thisRequestUtilJSON, thisRootUrl, thisUseFixtures;

describe("CertificateActions", () => {
  beforeEach(() => {
    thisConfiguration = null;
    thisRequestUtilJSON = RequestUtil.json;
    thisRootUrl = Config.rootUrl;
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = false;
    Config.rootUrl = "";
    RequestUtil.json = configuration => {
      thisConfiguration = configuration;
    };
  });

  afterEach(() => {
    Config.rootUrl = thisRootUrl;
    Config.useFixtures = thisUseFixtures;
    RequestUtil.json = thisRequestUtilJSON;
  });

  describe("#fetchCertificates", () => {
    it("dispatches the correct action when successful", () => {
      CertificateActions.fetchCertificates();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ALL_CERTIFICATES_SUCCESS,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      CertificateActions.fetchCertificates();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ALL_CERTIFICATES_ERROR,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } }
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      CertificateActions.fetchCertificates();
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });
});
