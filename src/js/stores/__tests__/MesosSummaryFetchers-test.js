/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { mount } from "enzyme";

const mockMesosSummaryStore = {
  getLastSuccessfulSummarySnapshot: jest.fn(),
  addChangeListener: jest.fn()
};
jest.mock("#SRC/js/stores/MesosSummaryStore", function() {
  return mockMesosSummaryStore;
});

const MesosFetchers = require("../MesosSummaryFetchers");

const PlaceholderComponent = ({ node }) => {
  // Cannot return object as child
  return JSON.stringify(node);
};
let Component;

describe("MesosHooks", () => {
  describe("#withNode", () => {
    beforeEach(function() {
      Component = MesosFetchers.withNode(PlaceholderComponent);
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot = jest.fn();
    });

    it("returns null if nodeId is null", () => {
      const params = {};
      const root = mount(<Component params={params} />);
      const component = root.find(PlaceholderComponent);
      expect(component.prop("node")).toEqual(null);
    });

    it("returns node corresponding to given ID", () => {
      const params = { nodeID: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1" };
      const node = {
        id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
        hostname: "foo.bar.baz"
      };
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot.mockReturnValue({
        slaves: [node]
      });

      const root = mount(<Component params={params} />);
      const component = root.find(PlaceholderComponent);
      expect(component.prop("node")).toEqual(expect.objectContaining(node));
    });

    it("returns null if no matching node for given ID", () => {
      const params = { nodeID: "notfound" };
      const node = {
        id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
        hostname: "foo.bar.baz"
      };
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot.mockReturnValue({
        slaves: [node]
      });

      const root = mount(<Component params={params} />);
      const component = root.find(PlaceholderComponent);
      expect(component.prop("node")).toEqual(null);
    });
  });
});
