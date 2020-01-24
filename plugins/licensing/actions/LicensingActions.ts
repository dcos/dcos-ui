import Config from "#SRC/js/config/Config";
import { RequestUtil } from "mesosphere-shared-reactjs";
import {
  REQUEST_LICENSING_SUMMARY_ERROR,
  REQUEST_LICENSING_SUMMARY_SUCCESS
} from "../constants/ActionTypes";
import { licensingAPIPrefix } from "../config/LicensingConfig";

const SDK = require("../SDK");

const LicensingActions = {
  fetchLicensingSummary() {
    RequestUtil.json({
      method: "GET",
      url: `${Config.rootUrl}${licensingAPIPrefix}/status`,
      success(response) {
        SDK.getSDK().dispatch({
          type: REQUEST_LICENSING_SUMMARY_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: REQUEST_LICENSING_SUMMARY_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const licensingSummaryFixtureImportPromise = import(
    /* licensingSummaryFixture */ "../../../tests/_fixtures/licensing/licensing-summary.json"
  );

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  licensingSummaryFixtureImportPromise.then(licensingSummaryFixture => {
    window.actionTypes.LicensingActions = {
      fetchLicensingSummary: {
        event: "success",
        success: { response: licensingSummaryFixture }
      }
    };

    Object.keys(window.actionTypes.LicensingActions).forEach(method => {
      LicensingActions[method] = RequestUtil.stubRequest(
        LicensingActions,
        "LicensingActions",
        method
      );
    });
  });
}

export default LicensingActions;
