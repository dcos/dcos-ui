import AppDispatcher from "../AppDispatcher";
import UnitHealthActions from "../UnitHealthActions";

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const Config = require("#SRC/js/config/Config").default;

let thisConfiguration;

describe("UnitHealthActions", () => {
  describe("#fetchUnits", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnits();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units"
      );
    });

    it("dispatches the correct action when successful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNITS_SUCCESS);
      });

      thisConfiguration.success({ bar: "bar" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNITS_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
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

  describe("#fetchUnit", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnit("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units/foo"
      );
    });

    it("dispatches the correct action when successful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_SUCCESS);
        expect(action.unitID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_ERROR);
        expect(action.unitID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
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

  describe("#fetchUnitNodes", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnitNodes("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units/foo/nodes"
      );
    });

    it("dispatches the correct action when successful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_UNIT_NODES_SUCCESS
        );
        expect(action.unitID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_UNIT_NODES_ERROR
        );
        expect(action.unitID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
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

  describe("#fetchUnitNode", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnitNode("foo", "bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units/foo/nodes/bar"
      );
    });

    it("dispatches the correct action when successful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_UNIT_NODE_SUCCESS
        );
        expect(action.data).toEqual({ bar: "baz" });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_NODE_ERROR);
        expect(action.unitID).toEqual("foo");
        expect(action.nodeID).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      var id = AppDispatcher.register(payload => {
        var action = payload.action;
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
