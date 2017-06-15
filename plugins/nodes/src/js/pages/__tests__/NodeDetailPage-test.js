jest.dontMock("../../../../../../src/js/components/charts/Chart");
jest.dontMock("../../../../../../src/js/mixins/InternalStorageMixin");
jest.dontMock("../../../../../../src/js/mixins/TabsMixin");
jest.dontMock("../../../../../../src/js/stores/MesosSummaryStore");
jest.dontMock("../nodes/NodeDetailPage");
jest.dontMock("../../../../../../src/js/components/RequestErrorMsg");
jest.dontMock("../../../../../../src/js/structs/CompositeState");
jest.dontMock("../../../../../../src/js/components/Page");

const JestUtil = require("../../../../../../src/js/utils/JestUtil");

JestUtil.unMockStores(["MesosSummaryStore", "MesosStateStore"]);
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const CompositeState = require("../../../../../../src/js/structs/CompositeState");
const MesosStateStore = require("../../../../../../src/js/stores/MesosStateStore");
const MesosSummaryActions = require("../../../../../../src/js/events/MesosSummaryActions");
const MesosSummaryStore = require("../../../../../../src/js/stores/MesosSummaryStore");
const Node = require("../../../../../../src/js/structs/Node");
const NodesList = require("../../../../../../src/js/structs/NodesList");
const NodeDetailPage = require("../nodes/NodeDetailPage");

describe("NodeDetailPage", function() {
  beforeEach(function() {
    this.fetchSummary = MesosSummaryActions.fetchSummary;
    this.getTasksFromNodeID = MesosStateStore.getTasksFromNodeID;
    this.storeGet = MesosStateStore.get;
    this.storeGetNode = MesosStateStore.getNodeFromID;
    this.getNodesList = CompositeState.getNodesList;

    this.container = global.document.createElement("div");

    CompositeState.getNodesList = function() {
      return new NodesList({ items: [{ id: "existingNode" }] });
    };

    MesosSummaryActions.fetchSummary = function() {
      return null;
    };
    MesosStateStore.getTasksFromNodeID = function() {
      return [];
    };

    MesosStateStore.get = function(key) {
      if (key === "lastMesosState") {
        return {
          version: "1"
        };
      }
      if (key === "statesProcessed") {
        return true;
      }
    };

    MesosStateStore.getNodeFromID = function(id) {
      if (id === "nonExistent") {
        return null;
      }

      return {
        id: "existingNode",
        version: "10",
        active: true,
        registered_time: 10
      };
    };
    MesosSummaryStore.init();
    MesosSummaryStore.processSummary({
      slaves: [
        {
          id: "foo",
          hostname: "bar"
        },
        {
          id: "existingNode",
          version: "10",
          active: true,
          registered_time: 10,
          sumTaskTypesByState() {
            return 1;
          }
        }
      ]
    });

    this.wrapper = ReactDOM.render(
      JestUtil.stubRouterContext(
        NodeDetailPage,
        {
          params: {
            nodeID: "nonExistent",
            taskID: "foo"
          },
          routes: [{ path: "/nodes/:nodeID", children: [] }]
        },
        {}
      ),
      this.container
    );
    this.instance = TestUtils.findRenderedComponentWithType(
      this.wrapper,
      NodeDetailPage
    );
  });

  afterEach(function() {
    MesosSummaryActions.fetchSummary = this.fetchSummary;
    MesosStateStore.getTasksFromNodeID = this.getTasksFromNodeID;
    MesosStateStore.get = this.storeGet;
    MesosStateStore.getNodeFromID = this.storeGetNode;
    MesosStateStore.removeAllListeners();
    MesosSummaryStore.removeAllListeners();
    ReactDOM.unmountComponentAtNode(this.container);
    CompositeState.getNodesList = this.getNodesList;
  });

  describe("#getNode", function() {
    it("should store an instance of Node", function() {
      var node = this.instance.getNode({ params: { nodeID: "existingNode" } });
      expect(node instanceof Node).toEqual(true);
      this.instance = null;
    });
  });
});
