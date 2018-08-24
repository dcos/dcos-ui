const MetadataStore = require("#SRC/js/stores/MetadataStore");
const ConfigStore = require("#SRC/js/stores/ConfigStore");
const EventTypes = require("#SRC/js/constants/EventTypes");

const NodeHealthStore = require("../../../nodes/src/js/stores/NodeHealthStore");

const { INTERCOM_CHANGE } = require("../../constants/EventTypes");
const IntercomStore = require("../IntercomStore");

describe("IntercomStore", function() {
  it("adds attribute", function() {
    IntercomStore.addAttribute("foo", "bar");
    expect(IntercomStore.attributes).toEqual({ foo: "bar" });
  });

  describe("#addChangeListener", function() {
    const addIntercomChangeListener = () => {
      IntercomStore.addChangeListener(INTERCOM_CHANGE, jest.genMockFunction());
    };

    beforeEach(function() {
      IntercomStore.removeAllListeners(INTERCOM_CHANGE);
    });

    it("triggers an action upon dcos metadata change", function() {
      const mockedFn = jest.genMockFunction();
      IntercomStore.onDCOSMetadataChange = mockedFn;

      addIntercomChangeListener();

      MetadataStore.emit(EventTypes.DCOS_METADATA_CHANGE);

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("triggers an action upon metadata change", function() {
      const mockedFn = jest.genMockFunction();
      IntercomStore.onMetadataChange = mockedFn;

      addIntercomChangeListener();

      MetadataStore.emit(EventTypes.METADATA_CHANGE);

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("triggers an action upon node health change", function() {
      const mockedFn = jest.genMockFunction();
      IntercomStore.onHealthNodesChange = mockedFn;

      addIntercomChangeListener();

      NodeHealthStore.emit(EventTypes.HEALTH_NODES_CHANGE);

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("triggers an action upon ccid success", function() {
      const mockedFn = jest.genMockFunction();
      IntercomStore.onClusterCCIDSuccess = mockedFn;

      addIntercomChangeListener();

      ConfigStore.emit(EventTypes.CLUSTER_CCID_SUCCESS);

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });
});
