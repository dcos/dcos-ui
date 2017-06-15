jest.dontMock("../SystemLogActions");
jest.dontMock("../../events/AppDispatcher");
jest.dontMock("../../constants/ActionTypes");
jest.dontMock("../../utils/SystemLogUtil");
jest.dontMock("../../utils/CookieUtils");

const cookie = require("cookie");
const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const Config = require("../../config/Config");
const SystemLogActions = require("../SystemLogActions");

const USER_COOKIE_KEY = "dcos-acs-info-cookie";

describe("SystemLogActions", function() {
  beforeEach(function() {
    // Mock cookie
    this.cookieParse = cookie.parse;
    cookie.parse = function() {
      var cookieObj = {};
      cookieObj[USER_COOKIE_KEY] = "aRandomCode";

      return cookieObj;
    };

    // Mock EventSource
    this.eventSource = new global.EventSource();
    spyOn(global, "EventSource").and.returnValue(this.eventSource);
  });

  afterEach(function() {
    cookie.parse = this.cookieParse;
    this.eventSource.close();
  });

  describe("#startTail", function() {
    beforeEach(function() {
      SystemLogActions.startTail("foo", {
        cursor: "bar",
        subscriptionID: "subscriptionID"
      });
    });

    it("calls #addEventListener from the global.EventSource", function() {
      this.eventSource.addEventListener = jasmine
        .createSpy("addEventListener")
        .and.callThrough();
      SystemLogActions.startTail("foo", { cursor: "bar" });
      expect(this.eventSource.addEventListener).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      const mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[0]).toEqual(
        "/system/v1/agent/foo/logs/v1/stream/?cursor=bar"
      );
      expect(mostRecent.args[1]).toEqual({ withCredentials: true });
    });

    it("sends without credentials when not available", function() {
      cookie.parse = function() {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = null;

        return cookieObj;
      };

      SystemLogActions.startTail("foo", { cursor: "bar" });
      const mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[1]).toEqual({ withCredentials: false });
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
      this.eventSource.dispatchEvent("message", event);
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
      this.eventSource.dispatchEvent("message", event);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_SYSTEM_LOG_ERROR);
      });

      this.eventSource.dispatchEvent("error", {});
    });

    it("dispatches the correct information when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({});
        expect(action.subscriptionID).toEqual("subscriptionID");
      });

      this.eventSource.dispatchEvent("error", {});
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
      this.eventSource.close = jasmine.createSpy("close");
      SystemLogActions.stopTail("subscriptionID");
      expect(this.eventSource.close).toHaveBeenCalled();
    });

    it("unsubscribes event listeners on message", function() {
      this.messageSpy = jasmine.createSpy("message");
      this.eventSource.addEventListener("message", this.messageSpy);
      SystemLogActions.stopTail("subscriptionID");

      const event = {
        data: "{}",
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent("message", event);

      expect(this.messageSpy).not.toHaveBeenCalled();
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
      this.eventSource.addEventListener = jasmine
        .createSpy("addEventListener")
        .and.callThrough();
      SystemLogActions.fetchRange("foo", { cursor: "bar" });
      expect(this.eventSource.addEventListener).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      const mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[0]).toEqual(
        "/system/v1/agent/foo/logs/v1/range/?cursor=bar&limit=3&read_reverse=true"
      );
      expect(mostRecent.args[1]).toEqual({ withCredentials: true });
    });

    it("sends without credentials when not available", function() {
      cookie.parse = function() {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = null;

        return cookieObj;
      };

      SystemLogActions.fetchRange("foo", { cursor: "bar" });
      const mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[1]).toEqual({ withCredentials: false });
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
      this.eventSource.dispatchEvent("error", event);
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
      this.eventSource.dispatchEvent("message", messageEvent);
      this.eventSource.dispatchEvent("message", messageEvent);
      this.eventSource.dispatchEvent("message", messageEvent);
      const closeEvent = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent("error", closeEvent);
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
      this.eventSource.dispatchEvent("message", messageEvent);
      this.eventSource.dispatchEvent("message", messageEvent);
      // Close before we the 3 events we have requested to show
      // that we have reached the top
      const closeEvent = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent("error", closeEvent);
    });

    it("reverses received data", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data[0].foo).toEqual(1);
        expect(action.data[1].foo).toEqual(0);
      });

      this.eventSource.dispatchEvent("message", {
        data: '{"foo": 0}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      });
      this.eventSource.dispatchEvent("message", {
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
      this.eventSource.dispatchEvent("error", closeEvent);
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
      this.eventSource.dispatchEvent("error", event);
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
      this.eventSource.dispatchEvent("error", event);
    });
  });

  describe("#fetchStreamTypes", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      SystemLogActions.fetchStreamTypes("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
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

      this.configuration.success(["one", "two"]);
    });

    it("dispatches the correct data when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual(["one", "two"]);
      });

      this.configuration.success(["one", "two"]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_SYSTEM_LOG_STREAM_TYPES_ERROR
        );
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct error when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      this.configuration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the message when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("baz");
      });

      this.configuration.error({
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

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
