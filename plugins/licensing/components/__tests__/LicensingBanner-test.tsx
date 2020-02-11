import * as React from "react";
import { shallow } from "enzyme";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("licensing", { enabled: true });
require("../../SDK").setSDK(SDK);

const LicensingBanner = require("../LicensingBanner").default;
const LicensingSummary = require("../../structs/LicensingSummary").default;
const LicensingStore = require("../../stores/LicensingStore").default;
const licensingFixture = require("../../../../tests/_fixtures/licensing/licensing-summary");
const { InfoBoxBanner } = require("@dcos/ui-kit");

let thisInstance;

describe("LicensingBanner", () => {
  describe("#render", () => {
    describe("renders banner", () => {
      function renderLicensingBanner(fixture) {
        const summary = new LicensingSummary(fixture);
        spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);

        return shallow(<LicensingBanner />);
      }

      it("renders InfoBox with warning appearance", () => {
        const instance = renderLicensingBanner(licensingFixture);

        const banner = instance.find(InfoBoxBanner);
        expect(banner.exists()).toBeTruthy();
        expect(banner.prop("appearance")).toBe("warning");
      });

      it("renders with node capacity breach message", () => {
        const instance = renderLicensingBanner(licensingFixture);
        expect(instance).toMatchSnapshot();
      });

      it("renders with expired breach message", () => {
        const copy = {
          ...licensingFixture
        };
        copy.current_timestamp = "2020-01-26T10:05:00+04:00";
        copy.number_of_breaches = 1;
        const instance = renderLicensingBanner(copy);
        expect(instance).toMatchSnapshot();
      });

      it("renders with node capacity and expired breach message", () => {
        const copy = {
          ...licensingFixture
        };
        copy.current_timestamp = "2020-01-26T10:05:00+04:00";
        const instance = renderLicensingBanner(copy);
        expect(instance).toMatchSnapshot();
      });
    });

    describe("renders nothing", () => {
      it("renders nothing when licensingSummary is null", () => {
        spyOn(LicensingStore, "getLicensingSummary").and.returnValue(null);
        const banner = shallow(<LicensingBanner />);

        expect(banner.find(".message").length).toBe(0);
      });

      it("renders nothing when licensingSummary has no breaches", () => {
        const copy = {
          ...licensingFixture
        };
        copy.number_of_breaches = 0;
        const summary = new LicensingSummary(copy);
        spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);
        const banner = shallow(<LicensingBanner />);

        expect(banner.find(".message").length).toBe(0);
      });
    });
  });

  describe("#getDaysExceeded", () => {
    it("calculates days exceeded correctly", () => {
      const summary = new LicensingSummary(licensingFixture);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);

      // 862 days remaining until expires
      const daysExceeded = summary.getDaysExceeded();
      expect(daysExceeded).toEqual(-862);
    });
  });

  describe("#onLicensingStoreLicensingSummarySuccess", () => {
    it("store the licensing summary in state", () => {
      const summary = new LicensingSummary(licensingFixture);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);
      thisInstance = shallow(<LicensingBanner />);

      expect(thisInstance.state("licensingSummary")).toEqual(summary);
    });
  });
});
