import AppDispatcher from "../../events/AppDispatcher";
import AuthActions from "../AuthActions";

import { RequestUtil } from "mesosphere-shared-reactjs";

import * as ActionTypes from "../../constants/ActionTypes";
import Config from "#SRC/js/config/Config";

let thisConfiguration;

describe("AuthActions", () => {
  describe("extra params", () => {
    it("passes extra parameters down to the auth service via query string params", () => {
      spyOn(RequestUtil, "json");

      AuthActions.login(undefined, "boo");

      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/auth/login?target=boo"
      );
    });
  });

  describe("#login", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      AuthActions.login();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/auth/login"
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGIN_SUCCESS);
      });

      thisConfiguration.success();
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGIN_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct error when unsuccessful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" },
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" },
      });
    });
  });

  describe("#logout", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      AuthActions.logout();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/auth/logout"
      );
    });

    it("dispatches the correct action when successful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGOUT_SUCCESS);
      });

      thisConfiguration.success();
    });

    it("dispatches the correct action when unsuccessful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_LOGOUT_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct error when unsuccessful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const id = AppDispatcher.register((payload) => {
        const action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" },
        });
      });

      thisConfiguration.error({
        foo: "bar",
        responseJSON: { description: "baz" },
      });
    });
  });
});
