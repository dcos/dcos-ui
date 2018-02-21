const JestUtil = require("#SRC/js/utils/JestUtil");

JestUtil.unMockStores(["MesosSummaryStore", "MesosStateStore"]);
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const CompositeState = require("#SRC/js/structs/CompositeState");
const MesosStateStore = require("#SRC/js/stores/MesosStateStore");
const MesosSummaryActions = require("#SRC/js/events/MesosSummaryActions");
const MesosSummaryStore = require("#SRC/js/stores/MesosSummaryStore");
const Node = require("#SRC/js/structs/Node");
const NodesList = require("#SRC/js/structs/NodesList");
const NodeDetailPage = require("../nodes/NodeDetailPage");

let thisFetchSummary,
  thisGetTasksFromNodeID,
  thisStoreGet,
  thisStoreGetNode,
  thisGetNodesList,
  thisStoreChangeListener,
  thisContainer,
  thisWrapper,
  thisInstance;

describe("NodeDetailPage", function() {
  beforeEach(function() {
    thisFetchSummary = MesosSummaryActions.fetchSummary;
    thisGetTasksFromNodeID = MesosStateStore.getTasksFromNodeID;
    thisStoreGet = MesosStateStore.get;
    thisStoreGetNode = MesosStateStore.getNodeFromID;
    thisGetNodesList = CompositeState.getNodesList;
    thisStoreChangeListener = MesosStateStore.addChangeListener;

    thisContainer = global.document.createElement("div");

    CompositeState.getNodesList = function() {
      return new NodesList({ items: [{ id: "existingNode" }] });
    };

    MesosSummaryActions.fetchSummary = function() {
      return null;
    };

    MesosStateStore.addChangeListener = function() {};

    MesosStateStore.getTasksFromNodeID = function() {
      return [];
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

    thisWrapper = ReactDOM.render(
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
      thisContainer
    );
    thisInstance = TestUtils.findRenderedComponentWithType(
      thisWrapper,
      NodeDetailPage
    );
  });

  afterEach(function() {
    MesosStateStore.addChangeListener = thisStoreChangeListener;
    MesosSummaryActions.fetchSummary = thisFetchSummary;
    MesosStateStore.getTasksFromNodeID = thisGetTasksFromNodeID;
    MesosStateStore.get = thisStoreGet;
    MesosStateStore.getNodeFromID = thisStoreGetNode;
    MesosStateStore.removeAllListeners();
    MesosSummaryStore.removeAllListeners();
    ReactDOM.unmountComponentAtNode(thisContainer);
    CompositeState.getNodesList = thisGetNodesList;
  });

  describe("#getNode", function() {
    it("stores an instance of Node", function() {
      var node = thisInstance.getNode({ params: { nodeID: "existingNode" } });
      expect(node instanceof Node).toEqual(true);
      thisInstance = null;
    });
  });
});
