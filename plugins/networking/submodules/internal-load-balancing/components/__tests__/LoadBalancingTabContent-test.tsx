import PluginSDK from "PluginSDK";

jest.mock("react-router");

const SDK = PluginSDK.__getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const LoadBalancingTabContent = require("../LoadBalancingTabContent").default;
const VIPSummaryList = require("../../structs/VIPSummaryList").default;
const NetworkingVIPSummariesStore = require("../../stores/NetworkingVIPSummariesStore")
  .default;

const React = require("react");

const ReactDOM = require("react-dom");

import vipSummariesFixture from "../../../../../../tests/_fixtures/networking/networking-vip-summaries.json";

let thisGetVIPSummaries, thisContainer, thisInstance, thisProcessedVIPSummaries;

describe("LoadBalancingTabContent", () => {
  beforeEach(() => {
    thisGetVIPSummaries = NetworkingVIPSummariesStore.getVIPSummaries;

    NetworkingVIPSummariesStore.getVIPSummaries = () =>
      new VIPSummaryList({ items: vipSummariesFixture.array });
    thisContainer = document.createElement("div");
    thisInstance = ReactDOM.render(<LoadBalancingTabContent />, thisContainer);

    thisProcessedVIPSummaries = thisInstance.getVIPSummaries();
  });

  afterEach(() => {
    NetworkingVIPSummariesStore.getVIPSummaries = thisGetVIPSummaries;
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#getFilteredVIPSummaries", () => {
    it("filters by vip", () => {
      const filteredSummaries = thisInstance.getFilteredVIPSummaries(
        thisProcessedVIPSummaries,
        "1.2.3.4"
      );

      expect(filteredSummaries.length).toEqual(1);
    });

    it("filters by name", () => {
      const filteredSummaries = thisInstance.getFilteredVIPSummaries(
        thisProcessedVIPSummaries,
        "new-service-address"
      );

      expect(filteredSummaries.length).toEqual(3);
    });

    it("filters by port", () => {
      const filteredSummaries = thisInstance.getFilteredVIPSummaries(
        thisProcessedVIPSummaries,
        "20"
      );

      expect(filteredSummaries.length).toEqual(1);
    });
  });

  describe("#getVIPSummaries", () => {
    it("returns an object with the correct properties", () => {
      const vipSummaries = thisInstance.getVIPSummaries();

      expect(Object.keys(vipSummaries[0])).toEqual([
        "name",
        "fullVIP",
        "vip",
        "successLastMinute",
        "failLastMinute",
        "failurePercent",
        "applicationReachabilityPercent",
        "machineReachabilityPercent",
        "p99Latency"
      ]);
    });
  });

  describe("#handleSearchStringChange", () => {
    it("sets state with the new search string", () => {
      thisInstance.handleSearchStringChange("foo");

      expect(thisInstance.state.searchString).toEqual("foo");
    });
  });

  describe("#resetFilter", () => {
    it("sets state with an empty string", () => {
      thisInstance.resetFilter();

      expect(thisInstance.state.searchString).toEqual("");
    });
  });
});
