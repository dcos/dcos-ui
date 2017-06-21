jest.dontMock("query-string");
jest.dontMock("../AuthActions");

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const AuthActions = require("../AuthActions");
const Config = require("../../config/Config");

describe("AuthActions", function() {
  describe("extra params", function() {
    it("passes extra parameters down to the auth service via query string params", function() {
      spyOn(RequestUtil, "json");

      AuthActions.login(undefined, "boo");

      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/auth/login?target=boo"
      );
    });
  });

  describe("#login", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      AuthActions.login();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.acsAPIPrefix + "/auth/login"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGIN_SUCCESS);
      });

      this.configuration.success();
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGIN_ERROR);
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

  describe("#logout", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      AuthActions.logout();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        Config.acsAPIPrefix + "/auth/logout"
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGOUT_SUCCESS);
      });

      this.configuration.success();
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGOUT_ERROR);
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
