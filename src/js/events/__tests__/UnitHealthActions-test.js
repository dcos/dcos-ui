jest.dontMock("../AppDispatcher");
jest.dontMock("../UnitHealthActions");
jest.dontMock("../../config/Config");
jest.dontMock("../../constants/ActionTypes");

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../AppDispatcher");
const Config = require("../../config/Config");
const UnitHealthActions = require("../UnitHealthActions");

describe("UnitHealthActions", function() {
  describe("#fetchUnits", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnits();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNITS_SUCCESS);
      });

      this.configuration.success({ bar: "bar" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNITS_ERROR);
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchUnit", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnit("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units/foo"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_SUCCESS);
        expect(action.unitID).toEqual("foo");
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_ERROR);
        expect(action.unitID).toEqual("foo");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchUnitNodes", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnitNodes("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units/foo/nodes"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_UNIT_NODES_SUCCESS
        );
        expect(action.unitID).toEqual("foo");
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_UNIT_NODES_ERROR
        );
        expect(action.unitID).toEqual("foo");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchUnitNode", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      UnitHealthActions.fetchUnitNode("foo", "bar");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.unitHealthAPIPrefix + "/units/foo/nodes/bar"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_HEALTH_UNIT_NODE_SUCCESS
        );
        expect(action.data).toEqual({ bar: "baz" });
      });

      this.configuration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_NODE_ERROR);
        expect(action.unitID).toEqual("foo");
        expect(action.nodeID).toEqual("bar");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
