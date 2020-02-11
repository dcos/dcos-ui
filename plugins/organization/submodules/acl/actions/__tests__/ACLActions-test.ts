import ACLActions from "../ACLActions";

import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

import * as ActionTypes from "../../constants/ActionTypes";

import Config from "#SRC/js/config/Config";

let thisConfiguration, thisRequestUtilJSON;

describe("ACLActions", () => {
  beforeEach(() => {
    thisConfiguration = null;
    thisRequestUtilJSON = RequestUtil.json;
    RequestUtil.json = configuration => {
      thisConfiguration = configuration;
    };
    Config.rootUrl = "";
    Config.useFixtures = false;
  });

  afterEach(() => {
    RequestUtil.json = thisRequestUtilJSON;
  });

  describe("#fetchACLs", () => {
    it("dispatches the correct action when successful", () => {
      ACLActions.fetchACLs("foo");
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_RESOURCE_ACLS_SUCCESS,

          data: { bar: "baz" },
          resourceType: "foo"
        });
      });

      thisConfiguration.success({ array: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      ACLActions.fetchACLs("bar");
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_RESOURCE_ACLS_ERROR,

          data: "bar",
          resourceType: "bar"
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      ACLActions.fetchACLs("foo");
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.fetchACLs("bar");
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/acls?type=bar"
      );
    });

    it("fetches data from the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.fetchACLs();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        Config.acsAPIPrefix + "/acls"
      );
    });
  });

  describe("#fetchACLSchema", () => {
    it("dispatches the correct action when successful", () => {
      ACLActions.fetchACLSchema();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_SCHEMA_SUCCESS,

          data: { displayName: "foo", groupName: "bar", rid: "baz", items: [] }
        });
      });

      thisConfiguration.success({
        displayName: "foo",
        groupName: "bar",
        rid: "baz",
        items: []
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      ACLActions.fetchACLSchema();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_SCHEMA_ERROR,
          data: "bar"
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      ACLActions.fetchACLSchema();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.fetchACLSchema();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        "/acs/acl-schema.json"
      );
    });
  });

  describe("#createACLForResource", () => {
    beforeEach(() => {
      ACLActions.createACLForResource("some.resource", {});
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_CREATE_SUCCESS,
          resourceID: "some.resource"
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_CREATE_ERROR,
          resourceID: "some.resource",
          data: "bar"
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("sends data to the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.createACLForResource("some.resource", {});
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.url).toEqual(
        Config.acsAPIPrefix + "/acls/some.resource"
      );
    });

    it("encodes resource", () => {
      spyOn(RequestUtil, "json");
      ACLActions.createACLForResource("some:resource/id", {});
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.url).toEqual(
        Config.acsAPIPrefix + "/acls/some:resource%252Fid"
      );
    });

    it("sends a PUT request", () => {
      spyOn(RequestUtil, "json");
      ACLActions.createACLForResource("some.resource", {});
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.method).toEqual("PUT");
    });
  });

  describe("#grantUserActionToResource", () => {
    beforeEach(() => {
      ACLActions.grantUserActionToResource("foo", "full", "bar");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
          triple: { userID: "foo", action: "full", resourceID: "bar" }
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_USER_GRANT_ACTION_ERROR,
          data: "bar",
          triple: { userID: "foo", action: "full", resourceID: "bar" },
          xhr: { responseJSON: { description: "bar" } }
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("sends data to the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.grantUserActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.url).toEqual(
        Config.acsAPIPrefix + "/acls/bar/users/foo/full"
      );
    });

    it("sends a PUT request", () => {
      spyOn(RequestUtil, "json");
      ACLActions.grantUserActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.method).toEqual("PUT");
    });
  });

  describe("#revokeUserActionToResource", () => {
    beforeEach(() => {
      ACLActions.revokeUserActionToResource("foo", "full", "bar");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
          triple: { userID: "foo", action: "full", resourceID: "bar" }
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
          data: "bar",
          triple: { userID: "foo", action: "full", resourceID: "bar" }
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("sends data to the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.revokeUserActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.url).toEqual(
        Config.acsAPIPrefix + "/acls/bar/users/foo/full"
      );
    });

    it("sends a DELETE request", () => {
      spyOn(RequestUtil, "json");
      ACLActions.revokeUserActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.method).toEqual("DELETE");
    });
  });

  describe("#grantGroupActionToResource", () => {
    beforeEach(() => {
      ACLActions.grantGroupActionToResource("foo", "full", "bar");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
          triple: { groupID: "foo", action: "full", resourceID: "bar" }
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
          data: "bar",
          triple: { groupID: "foo", action: "full", resourceID: "bar" },
          xhr: { responseJSON: { description: "bar" } }
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("sends data to the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.grantGroupActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.url).toEqual(
        Config.acsAPIPrefix + "/acls/bar/groups/foo/full"
      );
    });

    it("sends a PUT request", () => {
      spyOn(RequestUtil, "json");
      ACLActions.grantGroupActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.method).toEqual("PUT");
    });
  });

  describe("#revokeGroupActionToResource", () => {
    beforeEach(() => {
      ACLActions.revokeGroupActionToResource("foo", "full", "bar");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
          triple: { groupID: "foo", action: "full", resourceID: "bar" }
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
          data: "bar",
          triple: { groupID: "foo", resourceID: "bar", action: "full" }
        });
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("sends data to the correct URL", () => {
      spyOn(RequestUtil, "json");
      ACLActions.revokeGroupActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.url).toEqual(
        Config.acsAPIPrefix + "/acls/bar/groups/foo/full"
      );
    });

    it("sends a DELETE request", () => {
      spyOn(RequestUtil, "json");
      ACLActions.revokeUserActionToResource("foo", "full", "bar");
      const requestArgs = RequestUtil.json.calls.mostRecent().args[0];
      expect(requestArgs.method).toEqual("DELETE");
    });
  });
});
