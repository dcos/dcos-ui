const cookie = require("cookie");
const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const EventTypes = require("../../constants/EventTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const AuthStore = require("../AuthStore");

const USER_COOKIE_KEY = "dcos-acs-info-cookie";

global.atob =
  global.atob ||
  function() {
    return JSON.stringify({ uid: "joe", description: "Joe Doe" });
  };

let thisCookieParse, thisDocument;

describe("AuthStore", function() {
  beforeEach(function() {
    thisCookieParse = cookie.parse;
    global.document = { cookie: "" };
  });

  afterEach(function() {
    cookie.parse = thisCookieParse;
  });

  describe("#isLoggedIn", function() {
    it("returns false if there is no cookie set", function() {
      cookie.parse = function() {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = "";

        return cookieObj;
      };
      expect(AuthStore.isLoggedIn()).toEqual(false);
    });

    it("returns true if there is a cookie set", function() {
      cookie.parse = function() {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = "aRandomCode";

        return cookieObj;
      };
      expect(AuthStore.isLoggedIn()).toEqual(true);
    });
  });

  describe("#processLogoutSuccess", function() {
    beforeEach(function() {
      thisDocument = global.document;
      spyOn(cookie, "serialize");
      spyOn(AuthStore, "emit");
      AuthStore.processLogoutSuccess();
    });

    afterEach(function() {
      global.document = thisDocument;
    });

    it("sets the cookie to an empty string", function() {
      var args = cookie.serialize.calls.mostRecent().args;

      expect(args[0]).toEqual(USER_COOKIE_KEY);
      expect(args[1]).toEqual("");
    });

    it("emits a logout event", function() {
      var args = AuthStore.emit.calls.mostRecent().args;

      expect(args[0]).toEqual(EventTypes.AUTH_USER_LOGOUT_SUCCESS);
    });
  });

  describe("#login", function() {
    it("makes a request to login", function() {
      RequestUtil.json = jasmine.createSpy();
      AuthStore.login({});

      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#getUser", function() {
    beforeEach(function() {
      cookie.parse = function() {
        var cookieObj = {};
        // {uid: 'joe', description: 'Joe Doe'}
        cookieObj[USER_COOKIE_KEY] =
          "eyJ1aWQiOiJqb2UiLCJkZXNjcmlwdGlvbiI6IkpvZSBEb2UifQ==";

        return cookieObj;
      };
    });

    afterEach(function() {
      AuthStore.set({ role: undefined });
    });

    it("gets the user", function() {
      expect(AuthStore.getUser()).toEqual({
        uid: "joe",
        description: "Joe Doe"
      });
    });
  });

  describe("dispatcher", function() {
    describe("login", function() {
      it("dispatches the correct event upon error", function() {
        var mockedFn = jest.genMockFunction();
        AuthStore.addChangeListener(EventTypes.AUTH_USER_LOGIN_ERROR, mockedFn);
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_LOGIN_ERROR,
          data: "foo",
          xhr: { bar: "baz", qux: "nux" }
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual([
          "foo",
          { bar: "baz", qux: "nux" }
        ]);
      });
    });

    describe("logout", function() {
      it("dispatches the correct event upon success", function() {
        var mockedFn = jasmine.createSpy();
        AuthStore.addChangeListener(
          EventTypes.AUTH_USER_LOGOUT_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_LOGOUT_SUCCESS
        });

        expect(mockedFn.calls.count()).toEqual(1);
      });

      it("dispatches the correct event upon error", function() {
        var mockedFn = jest.genMockFunction();
        AuthStore.addChangeListener(
          EventTypes.AUTH_USER_LOGOUT_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_LOGOUT_ERROR
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });
    });
  });
});
