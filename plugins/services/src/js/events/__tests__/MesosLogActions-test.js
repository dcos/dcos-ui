const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const MesosLogActions = require("../MesosLogActions");
const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");

let thisConfiguration;

describe("MesosLogActions", function() {
  describe("#requestOffset", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MesosLogActions.requestOffset("foo", "bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        "/agent/foo/files/read?path=bar&offset=-1"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS
        );
      });

      thisConfiguration.success({ data: "", offset: 0 });
    });
    it("dispatches the correct information when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ data: "", offset: 0 });
        expect(action.path).toEqual("bar");
        expect(action.slaveID).toEqual("foo");
      });

      thisConfiguration.success({ data: "", offset: 0 });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MESOS_LOG_OFFSET_ERROR);
      });

      thisConfiguration.error({});
    });

    it("dispatches the correct information when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.path).toEqual("bar");
        expect(action.slaveID).toEqual("foo");
      });

      thisConfiguration.error({});
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

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchLog", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MesosLogActions.fetchLog("foo", "bar", 0, 2000);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        "/agent/foo/files/read?path=bar&offset=0&length=2000"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MESOS_LOG_SUCCESS);
      });

      thisConfiguration.success({ data: "", offset: 0 });
    });
    it("dispatches the correct information when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ data: "", offset: 0 });
        expect(action.path).toEqual("bar");
        expect(action.slaveID).toEqual("foo");
      });

      thisConfiguration.success({ data: "", offset: 0 });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MESOS_LOG_ERROR);
      });

      thisConfiguration.error({});
    });

    it("dispatches the correct information when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.path).toEqual("bar");
        expect(action.slaveID).toEqual("foo");
      });

      thisConfiguration.error({});
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

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchPreviousLog", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MesosLogActions.fetchPreviousLog("foo", "bar", 0, 2000);
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        "/agent/foo/files/read?path=bar&offset=0&length=2000"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_SUCCESS
        );
      });

      thisConfiguration.success({ data: "", offset: 0 });
    });
    it("dispatches the correct information when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({ data: "", offset: 0 });
        expect(action.path).toEqual("bar");
        expect(action.slaveID).toEqual("foo");
      });

      thisConfiguration.success({ data: "", offset: 0 });
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_ERROR
        );
      });

      thisConfiguration.error({});
    });

    it("dispatches the correct information when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.path).toEqual("bar");
        expect(action.slaveID).toEqual("foo");
      });

      thisConfiguration.error({});
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

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
