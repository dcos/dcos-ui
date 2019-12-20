import AppDispatcher from "../AppDispatcher";
import NodeHealthActions from "../NodeHealthActions";

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const Config = require("#SRC/js/config/Config").default;

let thisConfiguration;

describe("NodeHealthActions", () => {
  describe("#fetchNodes", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      NodeHealthActions.fetchNodes();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/nodes"
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODES_SUCCESS);
      });

      thisConfiguration.success({ bar: "bar" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODES_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchNode", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      NodeHealthActions.fetchNode("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/nodes/foo"
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODE_SUCCESS);
        expect(action.nodeID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODE_ERROR);
        expect(action.nodeID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchNodeUnits", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      NodeHealthActions.fetchNodeUnits("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/nodes/foo/units"
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_NODE_UNITS_SUCCESS
        );
        expect(action.nodeID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_NODE_UNITS_ERROR
        );
        expect(action.nodeID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchNodeUnit", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      NodeHealthActions.fetchNodeUnit("foo", "bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/nodes/foo/units/bar"
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_NODE_UNIT_SUCCESS
        );
        expect(action.data).toEqual({ bar: "baz" });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODE_UNIT_ERROR);
        expect(action.nodeID).toEqual("foo");
        expect(action.unitID).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register(payload => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
