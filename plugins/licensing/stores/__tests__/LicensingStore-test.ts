import PluginSDK from "PluginSDK";
import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("licensing", { enabled: true });
require("../../SDK").setSDK(SDK);
const LicensingStore = require("../LicensingStore").default;
const LicensingSummary = require("../../structs/LicensingSummary").default;
const EventTypes = require("../../constants/EventTypes");
import * as ActionTypes from "../../constants/ActionTypes";
const licensingSummaryFixture = require("../../../../tests/_fixtures/licensing/licensing-summary.json");

let thisRequestFn, thisLicensingSummaryFixture;

describe("LicensingStore", () => {
  describe("#fetchLicensingSummary", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = (handlers) => {
        handlers.success({
          ...licensingSummaryFixture,
        });
      };
      thisLicensingSummaryFixture = {
        ...licensingSummaryFixture,
      };
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns an instance of LicenseSummary", () => {
      LicensingStore.fetchLicensingSummary();
      const license = LicensingStore.getLicensingSummary();
      expect(license instanceof LicensingSummary).toBeTruthy();
    });

    it("returns the licenseSummary it was given", () => {
      LicensingStore.fetchLicensingSummary();
      const license = LicensingStore.getLicensingSummary();
      expect(license.getNumberBreaches()).toEqual(
        thisLicensingSummaryFixture.number_of_breaches
      );
      expect(license.getExpiration()).toEqual(
        thisLicensingSummaryFixture.end_timestamp
      );
    });

    describe("dispatcher", () => {
      it("stores licenseSummary when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_LICENSING_SUMMARY_SUCCESS,
          data: { gid: "foo", bar: "baz" },
        });

        const license = LicensingStore.getLicensingSummary();
        expect(license.get("gid")).toEqual("foo");
        expect(license.get("bar")).toEqual("baz");
      });

      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        LicensingStore.addChangeListener(
          EventTypes.LICENSING_SUMMARY_SUCCESS,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_LICENSING_SUMMARY_SUCCESS,
          data: { gid: "foo", bar: "baz" },
        });

        // Called twice because adding change listener starts polling
        expect(mockedFn.mock.calls.length).toEqual(2);
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        LicensingStore.addChangeListener(
          EventTypes.LICENSING_SUMMARY_ERROR,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_LICENSING_SUMMARY_ERROR,
          data: { message: "error" },
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });
    });
  });
});
