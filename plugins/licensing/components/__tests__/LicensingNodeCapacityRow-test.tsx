import * as React from "react";
import { shallow, mount } from "enzyme";

import PluginSDK from "PluginSDK";

const renderer = require("react-test-renderer");

const SDK = PluginSDK.__getSDK("licensing", { enabled: true });

require("../../SDK").setSDK(SDK);

const LicensingStore = require("../../stores/LicensingStore").default;
const LicensingNodeCapacityRow = require("../LicensingNodeCapacityRow").default;
const LicensingSummary = require("../../structs/LicensingSummary").default;
const licensingFixture = require("../../../../tests/_fixtures/licensing/licensing-summary");

describe("LicensingNodeCapacityRow", () => {
  describe("#render", () => {
    it("renders nothing when no data available", () => {
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(null);
      const expirationRow = shallow(<LicensingNodeCapacityRow />);

      expect(expirationRow.find(".configuration-map-row").length).toBe(0);
    });

    it("renders amount of nodes allowed message", () => {
      const summary = new LicensingSummary(licensingFixture);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);
      const instance = mount(<LicensingNodeCapacityRow />);

      expect(instance.find(".configuration-map-value").text()).toContain(
        "60 nodes"
      );
    });

    it("renders icon indicating a breach in nodes", () => {
      const summary = new LicensingSummary(licensingFixture);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);
      const instance = mount(<LicensingNodeCapacityRow />);

      expect(instance.find("svg").length).toBe(1);
    });

    it("does not render icon when no breach in nodes", () => {
      const copy = {
        ...licensingFixture,
      };
      copy.number_of_breaches = 0;
      const summary = new LicensingSummary(copy);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);
      const instance = mount(<LicensingNodeCapacityRow />);

      expect(instance.find("icon").length).toBe(0);
    });

    it("renders entire expiration row", () => {
      const summary = new LicensingSummary(licensingFixture);
      spyOn(LicensingStore, "getLicensingSummary").and.returnValue(summary);

      const instance = renderer.create(<LicensingNodeCapacityRow />);

      const tree = instance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
