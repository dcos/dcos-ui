jest.dontMock("../NodeHealthStore");
jest.dontMock("../../../../../../src/js/config/Config");
jest.dontMock("../../../../../../src/js/events/AppDispatcher");
jest.dontMock("../../../../../../src/js/events/UnitHealthActions");
jest.dontMock("../../../../../../tests/_fixtures/unit-health/nodes.json");

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../../../../../src/js/constants/ActionTypes");
const AppDispatcher = require("../../../../../../src/js/events/AppDispatcher");
const Config = require("../../../../../../src/js/config/Config");
const EventTypes = require("../../../../../../src/js/constants/EventTypes");
const NodesList = require("../../../../../../src/js/structs/NodesList");
const NodeHealthStore = require("../NodeHealthStore");
const nodesFixture = require("../../../../../../tests/_fixtures/unit-health/nodes.json");

describe("NodeHealthStore", function() {
  beforeEach(function() {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = function(handlers) {
      handlers.success(nodesFixture);
    };
    this.nodesFixture = Object.assign({}, nodesFixture);
  });

  afterEach(function() {
    RequestUtil.json = this.requestFn;
  });

  it("should return an instance of NodesList", function() {
    Config.useFixtures = true;
    NodeHealthStore.fetchNodes();
    var nodes = NodeHealthStore.getNodes("nodes");
    expect(nodes instanceof NodesList).toBeTruthy();
    Config.useFixtures = false;
  });

  it("should return all of the nodes it was given", function() {
    Config.useFixtures = true;
    NodeHealthStore.fetchNodes();
    var nodes = NodeHealthStore.getNodes().getItems();
    expect(nodes.length).toEqual(this.nodesFixture.nodes.length);
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
