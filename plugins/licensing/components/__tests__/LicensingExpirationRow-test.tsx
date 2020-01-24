import * as React from "react";
import { mount } from "enzyme";
import JestUtil from "#SRC/js/utils/JestUtil";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("licensing", { enabled: true });
require("../../SDK").setSDK(SDK);

const LicensingStore = require("../../stores/LicensingStore").default;
const LicensingExpirationRow = require("../LicensingExpirationRow").default;
const LicensingSummary = require("../../structs/LicensingSummary").default;

const renderer = require("react-test-renderer");

const licensingFixture = require("../../../../tests/_fixtures/licensing/licensing-summary");

const WrappedComponent = JestUtil.withI18nProvider(LicensingExpirationRow);

describe("LicensingExpirationRow", () => {
  describe("#render", () => {
    it("renders nothing when no data available", () => {
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(null);
      const expirationRow = mount(<WrappedComponent />);

      expect(expirationRow.find(".configuration-map-row").length).toBe(0);
    });

    it("renders days remaining message when not expired", () => {
      const summary = new LicensingSummary(licensingFixture);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);
      const instance = mount(<WrappedComponent />);

      const toggleValue = instance.find(".configuration-map-value");
      expect(toggleValue.text()).toContain("days left");
    });

    it("renders expired message when expired", () => {
      const copy = {
        ...licensingFixture
      };
      copy.current_timestamp = "2020-01-26T10:05:00+04:00";
      const summary = new LicensingSummary(copy);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);
      const instance = mount(<WrappedComponent />);

      expect(instance.find(".configuration-map-value").text()).toContain(
        "days overdue"
      );
    });

    it("renders entire expiration row", () => {
      const summary = new LicensingSummary(licensingFixture);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);

      const instance = renderer.create(<WrappedComponent />);

      const tree = instance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
