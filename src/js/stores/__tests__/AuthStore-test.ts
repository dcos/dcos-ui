import AppDispatcher from "../../events/AppDispatcher";
import AuthStore from "../AuthStore";
import * as EventTypes from "../../constants/EventTypes";

const cookie = require("cookie");
import { RequestUtil } from "mesosphere-shared-reactjs";

import * as ActionTypes from "../../constants/ActionTypes";

const USER_COOKIE_KEY = "dcos-acs-info-cookie";

window.atob =
  window.atob || (() => JSON.stringify({ uid: "joe", description: "Joe Doe" }));

let thisCookieParse, thisDocument;

describe("AuthStore", () => {
  beforeEach(() => {
    thisCookieParse = cookie.parse;
    document = { cookie: "" };
  });

  afterEach(() => {
    cookie.parse = thisCookieParse;
  });

  describe("#isLoggedIn", () => {
    it("returns false if there is no cookie set", () => {
      cookie.parse = () => {
        const cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = "";

        return cookieObj;
      };
      expect(AuthStore.isLoggedIn()).toEqual(false);
    });

    it("returns true if there is a cookie set", () => {
      cookie.parse = () => {
        const cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = "aRandomCode";

        return cookieObj;
      };
      expect(AuthStore.isLoggedIn()).toEqual(true);
    });
  });

  describe("#processLogoutSuccess", () => {
    beforeEach(() => {
      thisDocument = document;
      spyOn(cookie, "serialize");
      spyOn(AuthStore, "emit");
      AuthStore.processLogoutSuccess();
    });

    afterEach(() => {
      document = thisDocument;
    });

    it("sets the cookie to an empty string", () => {
      const args = cookie.serialize.calls.mostRecent().args;

      expect(args[0]).toEqual(USER_COOKIE_KEY);
      expect(args[1]).toEqual("");
    });

    it("emits a logout event", () => {
      const args = AuthStore.emit.calls.mostRecent().args;

      expect(args[0]).toEqual(EventTypes.AUTH_USER_LOGOUT_SUCCESS);
    });
  });

  describe("#login", () => {
    it("makes a request to login", () => {
      RequestUtil.json = jasmine.createSpy();
      AuthStore.login({});

      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#getUser", () => {
    beforeEach(() => {
      cookie.parse = () => {
        const cookieObj = {};
        // {uid: 'joe', description: 'Joe Doe'}
        cookieObj[USER_COOKIE_KEY] =
          "eyJ1aWQiOiJqb2UiLCJkZXNjcmlwdGlvbiI6IkpvZSBEb2UifQ==";

        return cookieObj;
      };
    });

    afterEach(() => {
      AuthStore.set({ role: undefined });
    });

    it("gets the user", () => {
      expect(AuthStore.getUser()).toEqual({
        uid: "joe",
        description: "Joe Doe"
      });
    });
  });

  describe("dispatcher", () => {
    describe("login", () => {
      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
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

    describe("logout", () => {
      it("dispatches the correct event upon success", () => {
        const mockedFn = jasmine.createSpy();
        AuthStore.addChangeListener(
          EventTypes.AUTH_USER_LOGOUT_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_LOGOUT_SUCCESS
        });

        expect(mockedFn.calls.count()).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
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
