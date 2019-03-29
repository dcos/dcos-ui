const React = require("react");
const renderer = require("react-test-renderer");

const mockMesosSummaryStore = {
  getLastSuccessfulSummarySnapshot: jest.fn(),
  addChangeListener: jest.fn()
};
jest.mock("#SRC/js/stores/MesosSummaryStore", function() {
  return mockMesosSummaryStore;
});

const MesosHooks = require("../MesosHooks");

const HookDemoComponent = ({ nodeId }) => {
  const node = MesosHooks.useNode(nodeId);

  // Cannot return object as child
  return JSON.stringify(node);
};

describe("MesosHooks", () => {
  describe("#useNode", () => {
    beforeEach(function() {
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot = jest.fn();
    });

    it("returns null if nodeId is null", () => {
      const root = renderer.create(<HookDemoComponent />).toJSON();
      expect(root).toEqual("null");
    });

    it("returns node corresponding to given ID", () => {
      const node = {
        id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
        hostname: "foo.bar.baz"
      };
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot.mockReturnValue({
        slaves: [node]
      });
      const root = renderer
        .create(
          <HookDemoComponent nodeId="e99adb4a-eee7-4e48-ba86-79cd061d2215-S1" />
        )
        .toJSON();
      expect(JSON.parse(root)).toEqual(node);
    });

    it("returns null if no matching node for given ID", () => {
      const node = {
        id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
        hostname: "foo.bar.baz"
      };
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot.mockReturnValue({
        slaves: [node]
      });
      const root = renderer
        .create(<HookDemoComponent nodeId="notfound" />)
        .toJSON();
      expect(JSON.parse(root)).toEqual(null);
    });
  });
});
