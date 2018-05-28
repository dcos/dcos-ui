const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const Config = require("#SRC/js/config/Config").default;
const SystemLogActions = require("../SystemLogActions");

let thisEventSource, thisMessageSpy, thisConfiguration;

describe("SystemLogActions", function() {
  beforeEach(function() {
    // Mock EventSource
    thisEventSource = new global.EventSource();
    spyOn(global, "EventSource").and.returnValue(thisEventSource);
  });

  afterEach(function() {
    thisEventSource.close();
  });

  describe("#startTail", function() {
    beforeEach(function() {
      SystemLogActions.startTail("foo", {
        cursor: "bar",
        subscriptionID: "subscriptionID"
      });
    });

    it("calls #addEventListener from the global.EventSource", function() {
      thisEventSource.addEventListener = jasmine
        .createSpy("addEventListener")
        .and.callThrough();
      SystemLogActions.startTail("foo", { cursor: "bar" });
      expect(thisEventSource.addEventListener).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      const mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[0]).toEqual(
        "/system/v1/agent/foo/logs/v1/stream/?cursor=bar"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_SYSTEM_LOG_SUCCESS);
      });

      const event = {
        data: "{}",
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("message", event);
    });

    it("dispatches the correct information when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual([{}]);
        expect(action.subscriptionID).toEqual("subscriptionID");
      });

      const event = {
        data: "{}",
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("message", event);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_SYSTEM_LOG_ERROR);
      });

      thisEventSource.dispatchEvent("error", {});
    });

    it("dispatches the correct information when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({});
        expect(action.subscriptionID).toEqual("subscriptionID");
      });

      thisEventSource.dispatchEvent("error", {});
    });
  });

  describe("#stopTail", function() {
    beforeEach(function() {
      SystemLogActions.startTail("foo", {
        cursor: "bar",
        subscriptionID: "subscriptionID"
      });
    });

    it("calls #close on the EventSource", function() {
      thisEventSource.close = jasmine.createSpy("close");
      SystemLogActions.stopTail("subscriptionID");
      expect(thisEventSource.close).toHaveBeenCalled();
    });

    it("unsubscribes event listeners on message", function() {
      thisMessageSpy = jasmine.createSpy("message");
      thisEventSource.addEventListener("message", thisMessageSpy);
      SystemLogActions.stopTail("subscriptionID");

      const event = {
        data: "{}",
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("message", event);

      expect(thisMessageSpy).not.toHaveBeenCalled();
    });
  });

  describe("#fetchRange", function() {
    beforeEach(function() {
      SystemLogActions.fetchRange("foo", {
        cursor: "bar",
        limit: 3,
        subscriptionID: "subscriptionID"
      });
    });

    it("calls #addEventListener from the EventSource", function() {
      thisEventSource.addEventListener = jasmine
        .createSpy("addEventListener")
        .and.callThrough();
      SystemLogActions.fetchRange("foo", { cursor: "bar" });
      expect(thisEventSource.addEventListener).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      const mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[0]).toEqual(
        "/system/v1/agent/foo/logs/v1/range/?cursor=bar&limit=3&read_reverse=true"
      );
    });

    it("dispatches the correct action when closing connection", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS
        );
      });

      const event = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("error", event);
    });

    it("dispatches the correct information when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.length).toEqual(3);
        expect(action.subscriptionID).toEqual("subscriptionID");
        expect(action.firstEntry).toEqual(false);
      });

      const messageEvent = {
        data: "{}",
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("message", messageEvent);
      thisEventSource.dispatchEvent("message", messageEvent);
      thisEventSource.dispatchEvent("message", messageEvent);
      const closeEvent = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("error", closeEvent);
    });

    it("tells when the top has been reached", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.length).toEqual(2);
        expect(action.subscriptionID).toEqual("subscriptionID");
        expect(action.firstEntry).toEqual(true);
      });

      const messageEvent = {
        data: "{}",
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("message", messageEvent);
      thisEventSource.dispatchEvent("message", messageEvent);
      // Close before we the 3 events we have requested to show
      // that we have reached the top
      const closeEvent = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("error", closeEvent);
    });

    it("reverses received data", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data[0].foo).toEqual(1);
        expect(action.data[1].foo).toEqual(0);
      });

      thisEventSource.dispatchEvent("message", {
        data: '{"foo": 0}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      });
      thisEventSource.dispatchEvent("message", {
        data: '{"foo": 1}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      });
      // Close before we the 3 events we have requested to show
      // that we have reached the top
      const closeEvent = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      thisEventSource.dispatchEvent("error", closeEvent);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_SYSTEM_LOG_ERROR
        );
      });

      const event = { eventPhase: global.EventSource.CONNECTING };
      thisEventSource.dispatchEvent("error", event);
    });

    it("dispatches the correct information when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({
          eventPhase: global.EventSource.CONNECTING
        });
        expect(action.subscriptionID).toEqual("subscriptionID");
      });

      const event = { eventPhase: global.EventSource.CONNECTING };
      thisEventSource.dispatchEvent("error", event);
    });
  });

  describe("#fetchStreamTypes", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      SystemLogActions.fetchStreamTypes("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(thisConfiguration.url).toEqual(
        Config.logsAPIPrefix + "/foo/logs/v1/fields/STREAM"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_SYSTEM_LOG_STREAM_TYPES_SUCCESS
        );
      });

      thisConfiguration.success(["one", "two"]);
    });

    it("dispatches the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual(["one", "two"]);
      });

      thisConfiguration.success(["one", "two"]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_SYSTEM_LOG_STREAM_TYPES_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct error when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the message when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("baz");
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
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
