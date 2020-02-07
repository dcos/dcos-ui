import ACLUsersActions from "../ACLUsersActions";

import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration;

describe("ACLUsersActions", () => {
  describe("#fetchUser", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLUsersActions.fetchUser("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_USER_SUCCESS);
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual({ bar: "baz" });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_USER_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the userID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchUserGroups", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLUsersActions.fetchUserGroups("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_USER_GROUPS_SUCCESS
        );
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual({ bar: "baz" });
      });

      thisConfiguration.success({ array: { bar: "baz" } });
    });

    it("dispatches with the userID successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_USER_GROUPS_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the userID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchUserPermissions", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLUsersActions.fetchUserPermissions("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_USER_PERMISSIONS_SUCCESS
        );
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual({ bar: "baz" });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches with the userID successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_USER_PERMISSIONS_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the userID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#updateUser", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLUsersActions.updateUser("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(Config.acsAPIPrefix + "/users/foo");
    });

    it("uses PATCH for the request method", () => {
      expect(thisConfiguration.method).toEqual("PATCH");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_USER_UPDATE_SUCCESS
        );
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the userID when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_USER_UPDATE_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct message when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the userID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#addLDAPUser", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLUsersActions.addLDAPUser({ username: "foo" });
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/ldap/importuser"
      );
    });

    it("uses POST for the request method", () => {
      expect(thisConfiguration.method).toEqual("POST");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_LDAP_USER_CREATE_SUCCESS
        );
      });

      thisConfiguration.success({ username: "foo" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_LDAP_USER_CREATE_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct message when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the userID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.userID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });
});
