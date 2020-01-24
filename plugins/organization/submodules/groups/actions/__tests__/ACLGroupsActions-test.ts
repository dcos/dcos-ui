import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const mockRequest = jest.fn();

jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);
import * as ActionTypes from "../../constants/ActionTypes";

import Config from "#SRC/js/config/Config";

const ACLGroupsActions = require("../ACLGroupsActions").default;

let thisConfiguration;

describe("ACLGroupsActions", () => {
  describe("#fetch", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.fetch();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      ACLGroupsActions.fetch();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUPS_SUCCESS);
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      ACLGroupsActions.fetch();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUPS_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("calls #json from the RequestUtil", () => {
      ACLGroupsActions.fetch();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      ACLGroupsActions.fetch();
      expect(thisConfiguration.url).toEqual(Config.acsAPIPrefix + "/groups");
    });
  });

  describe("#fetchGroup", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.fetchGroup("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUP_SUCCESS);
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual({ array: { bar: "baz" } });
      });

      thisConfiguration.success({ array: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUP_ERROR);
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

    it("dispatches with the groupID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchGroupServiceAccounts", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.fetchGroupServiceAccounts("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_SUCCESS
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

    it("dispatches with the groupID successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_ERROR
        );
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

    it("dispatches with the groupID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchGroupUsers", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.fetchGroupUsers("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_USERS_SUCCESS
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

    it("dispatches with the groupID successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUP_USERS_ERROR);
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

    it("dispatches with the groupID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchGroupPermissions", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.fetchGroupPermissions("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_PERMISSIONS_SUCCESS
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

    it("dispatches with the groupID successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_PERMISSIONS_ERROR
        );
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

    it("dispatches with the groupID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#addGroup", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.addGroup({ gid: "foo" });
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/groups/foo"
      );
    });

    it("uses PUT for the request method", () => {
      expect(thisConfiguration.method).toEqual("PUT");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_CREATE_SUCCESS
        );
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the correct groupID when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUP_CREATE_ERROR);
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

    it("dispatches the correct groupID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#addLDAPGroup", () => {
    let mockObservable;
    beforeEach(() => {
      mockRequest.mockReset();
      mockObservable = {
        subscribe: jest.fn()
      };
      mockRequest.mockReturnValue(mockObservable);
      ACLGroupsActions.addLDAPGroup({ groupname: "foo" });
    });

    it("calls request from the http-service", () => {
      expect(mockRequest).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(mockRequest).toHaveBeenCalledWith(
        Config.acsAPIPrefix + "/ldap/importgroup",
        expect.any(Object)
      );
    });

    it("uses POST for the request method", () => {
      expect(mockRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("subscribes to the observable", () => {
      expect(mockObservable.subscribe).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", () => {
      expect.assertions(1);
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_LDAP_GROUP_CREATE_SUCCESS
        );
      });

      mockObservable.subscribe.mock.calls[0][0].next({
        code: 200,
        response: { groupname: "foo" }
      });
    });

    it("dispatches the correct action when partially successful", () => {
      expect.assertions(1);
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_LDAP_GROUP_CREATE_PARTIAL_SUCCESS
        );
      });

      mockObservable.subscribe.mock.calls[0][0].next({
        code: 202,
        response: {
          groupname: "foo",
          imported_user_count: 300
        }
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      expect.assertions(1);
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_LDAP_GROUP_CREATE_ERROR
        );
      });

      mockObservable.subscribe.mock.calls[0][0].error({
        code: 400,
        response: {
          message: "bar"
        }
      });
    });

    it("dispatches the correct message when unsuccessful", () => {
      expect.assertions(1);
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      mockObservable.subscribe.mock.calls[0][0].error({
        code: 400,
        response: {
          description: "bar"
        }
      });
    });

    it("dispatches the groupID when unsuccessful", () => {
      expect.assertions(1);
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      mockObservable.subscribe.mock.calls[0][0].error({
        code: 400,
        response: {
          message: "bar"
        }
      });
    });

    it("doesn't fail when no error data", () => {
      expect.assertions(1);
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.data.split("?", 1)).toEqual([
          "Could not import group. Are you sure this group exists"
        ]);
      });

      mockObservable.subscribe.mock.calls[0][0].error({});
    });
  });

  describe("#updateGroup", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.updateGroup("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/groups/foo"
      );
    });

    it("uses PATCH for the request method", () => {
      expect(thisConfiguration.method).toEqual("PATCH");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_UPDATE_SUCCESS
        );
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the groupID when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUP_UPDATE_ERROR);
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

    it("dispatches the groupID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#deleteGroup", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.deleteGroup("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/groups/foo"
      );
    });

    it("uses DELETE for the request method", () => {
      expect(thisConfiguration.method).toEqual("DELETE");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_GROUP_DELETE_SUCCESS
        );
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the groupID when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_ACL_GROUP_DELETE_ERROR);
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

    it("dispatches the groupID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.groupID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#addUser", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.addUser("foo", "bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          __origin: "organization",
          type: ActionTypes.REQUEST_ACL_GROUP_ADD_USER_SUCCESS,
          userID: "bar",
          groupID: "foo"
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          __origin: "organization",
          type: ActionTypes.REQUEST_ACL_GROUP_ADD_USER_ERROR,
          data: "bar",
          userID: "bar",
          groupID: "foo"
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#deleteUser", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLGroupsActions.deleteUser("foo", "bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          __origin: "organization",
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_SUCCESS,
          userID: "bar",
          groupID: "foo"
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          __origin: "organization",
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_ERROR,
          data: "bar",
          userID: "bar",
          groupID: "foo"
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });
});
