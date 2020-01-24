import BackendsTable from "../BackendsTable";
import VIPDetail from "../../structs/VIPDetail";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });

require("../../../../SDK").setSDK(SDK);

const React = require("react");

const ReactDOM = require("react-dom");

import vipDetailFixture from "../../../../../../tests/_fixtures/networking/networking-vip-detail.json";

let thisBackends, thisContainer, thisInstance, thisProcessedBackends;

describe("BackendsTable", () => {
  beforeEach(() => {
    thisBackends = new VIPDetail(vipDetailFixture).getBackends();

    thisContainer = document.createElement("div");
    thisInstance = ReactDOM.render(
      <BackendsTable backends={thisBackends} />,
      thisContainer
    );

    thisProcessedBackends = thisInstance.processBackends(thisBackends);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#alignTableCellRight", () => {
    it("returns true for the specified column props", () => {
      const rightAlignedProps = [
        "successLastMinute",
        "failLastMinute",
        "p99Latency"
      ];

      const alignTableCellRight = thisInstance.alignTableCellRight;
      rightAlignedProps.forEach(prop => {
        expect(alignTableCellRight(prop)).toEqual(true);
      });
    });

    it("returns false for the unspecified props", () => {
      expect(thisInstance.alignTableCellRight("foo")).toEqual(false);
    });
  });

  describe("#handleSearchStringChange", () => {
    it("sets state with the new search string", () => {
      thisInstance.handleSearchStringChange("foo");

      expect(thisInstance.state.searchString).toEqual("foo");
    });
  });

  describe("#hideColumnAtMini", () => {
    it("returns true for the specified column props", () => {
      const hiddenColumnsAtMini = [
        "failurePercent",
        "applicationReachabilityPercent",
        "machineReachabilityPercent"
      ];

      const hideColumnAtMini = thisInstance.hideColumnAtMini;
      hiddenColumnsAtMini.forEach(prop => {
        expect(hideColumnAtMini(prop)).toEqual(true);
      });
    });

    it("returns false for the unspecified props", () => {
      expect(thisInstance.hideColumnAtMini("foo")).toEqual(false);
    });
  });

  describe("#processBackends", () => {
    it("returns an array of objects with the correct properties", () => {
      expect(Object.keys(thisProcessedBackends[0])).toEqual([
        "ip",
        "port",
        "successLastMinute",
        "failLastMinute",
        "p99Latency",
        "taskID",
        "frameworkID",
        "machineReachability",
        "appReachability",
        "fullIPString"
      ]);
    });
  });

  describe("#renderMilliseconds", () => {
    it("returns the specified key's value from an object with the string 'ms' appended", () => {
      const percentage = thisInstance.renderMilliseconds("foo", {
        foo: "100"
      });
      expect(percentage).toEqual("100ms");
    });
  });
});
