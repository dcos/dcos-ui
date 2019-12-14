import AppDispatcher from "#SRC/js/events/AppDispatcher";
import NodesList from "#SRC/js/structs/NodesList";
import * as EventTypes from "#SRC/js/constants/EventTypes";
import NodeHealthStore from "../NodeHealthStore";

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("#SRC/js/constants/ActionTypes");
const Config = require("#SRC/js/config/Config").default;
const nodesFixture = require("../../../../../../tests/_fixtures/unit-health/nodes.json");

let thisRequestFn, thisNodesFixture;

describe("NodeHealthStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(nodesFixture);
    };
    thisNodesFixture = Object.assign({}, nodesFixture);
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns an instance of NodesList", () => {
    Config.useFixtures = true;
    NodeHealthStore.fetchNodes();
    var nodes = NodeHealthStore.getNodes("nodes");
    expect(nodes instanceof NodesList).toBeTruthy();
    Config.useFixtures = false;
  });

  it("returns all of the nodes it was given", () => {
    Config.useFixtures = true;
    NodeHealthStore.fetchNodes();
    var nodes = NodeHealthStore.getNodes().getItems();
    expect(nodes.length).toEqual(thisNodesFixture.nodes.length);
    Config.useFixtures = false;
  });

  describe("dispatcher", () => {
    it("stores nodes when event is dispatched", () => {
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

    it("dispatches the correct event upon success", () => {
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

    it("dispatches the correct event upon error", () => {
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
