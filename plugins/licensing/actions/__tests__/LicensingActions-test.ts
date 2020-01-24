import PluginTestUtils from "PluginTestUtils";
import { RequestUtil } from "mesosphere-shared-reactjs";
import { licensingAPIPrefix } from "../../config/LicensingConfig";
import LicensingActions from "../LicensingActions";

const SDK = PluginTestUtils.getSDK("licensing", { enabled: true });
require("../../SDK").setSDK(SDK);

import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration;

describe("CertificateActions", () => {
  describe("#fetchLicensingSummary", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      LicensingActions.fetchLicensingSummary();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_LICENSING_SUMMARY_SUCCESS
        );
      });

      thisConfiguration.success({ number_of_breaches: 2 });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual({ number_of_breaches: 2 });
      });

      thisConfiguration.success({ number_of_breaches: 2 });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_LICENSING_SUMMARY_ERROR
        );
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual("error");
      });

      thisConfiguration.error({ responseJSON: { message: "error" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.xhr).toEqual({ message: "error" });
      });

      thisConfiguration.error({ message: "error" });
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(`${licensingAPIPrefix}/status`);
    });

    it("sends a GET request", () => {
      expect(thisConfiguration.method).toEqual("GET");
    });
  });
});
