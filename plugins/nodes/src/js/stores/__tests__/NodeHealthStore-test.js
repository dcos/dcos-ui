const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("#SRC/js/constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const Config = require("#SRC/js/config/Config");
const EventTypes = require("#SRC/js/constants/EventTypes");
const NodesList = require("#SRC/js/structs/NodesList");
const NodeHealthStore = require("../NodeHealthStore");
const nodesFixture = require("../../../../../../tests/_fixtures/unit-health/nodes.json");

let thisRequestFn, thisNodesFixture;

describe("NodeHealthStore", function() {
  beforeEach(function() {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = function(handlers) {
      handlers.success(nodesFixture);
    };
    thisNodesFixture = Object.assign({}, nodesFixture);
  });

  afterEach(function() {
    RequestUtil.json = thisRequestFn;
  });

  it("returns an instance of NodesList", function() {
    Config.useFixtures = true;
    NodeHealthStore.fetchNodes();
    var nodes = NodeHealthStore.getNodes("nodes");
    expect(nodes instanceof NodesList).toBeTruthy();
    Config.useFixtures = false;
  });

  it("returns all of the nodes it was given", function() {
    Config.useFixtures = true;
    NodeHealthStore.fetchNodes();
    var nodes = NodeHealthStore.getNodes().getItems();
    expect(nodes.length).toEqual(thisNodesFixture.nodes.length);
    Config.useFixtures = false;
  });

  describe("dispatcher", function() {
    it("stores nodes when event is dispatched", function() {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_NODES_SUCCESS,
        data: [
          {
            host_ip: "167.114.218.155",
            "role:": "agent",
            health: 0
          }
        ]
      });

      var nodes = NodeHealthStore.getNodes().getItems();
      expect(nodes[0].host_ip).toEqual("167.114.218.155");
      expect(nodes[0].health).toEqual(0);
    });

    it("dispatches the correct event upon success", function() {
      var mockedFn = jasmine.createSpy();
      NodeHealthStore.addChangeListener(
        EventTypes.HEALTH_NODES_CHANGE,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_NODES_SUCCESS,
        data: []
      });

      expect(mockedFn.calls.count()).toEqual(2);
    });

    it("dispatches the correct event upon error", function() {
      var mockedFn = jasmine.createSpy();
      NodeHealthStore.addChangeListener(
        EventTypes.HEALTH_NODES_ERROR,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_NODES_ERROR,
        data: "foo"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo"]);
    });
  });
});
