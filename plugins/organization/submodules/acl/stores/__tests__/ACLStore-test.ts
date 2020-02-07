import * as EventTypes from "../../constants/EventTypes";

import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const ACLActions = require("../../actions/ACLActions").default;
const ACLList = require("../../structs/ACLList").default;
const ACLStore = require("../ACLStore").default;
const PermissionTree = require("../../structs/PermissionTree").default;
import * as ActionTypes from "../../constants/ActionTypes";
const OrganizationReducer = require("../../../../Reducer");

PluginTestUtils.addReducer("organization", OrganizationReducer);

const aclsFixture = require("../../../../../../tests/_fixtures/acl/acls-unicode.json");
const aclSchema = require("../../../../../../tests/_fixtures/acl/acl-schema.json");

let thisRequestFn, thisAclsFixture, thisAclSchema;

describe("ACLStore", () => {
  describe("#fetchACLs", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(aclsFixture);
      };
      thisAclsFixture = {
        ...aclsFixture
      };
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns an instance of ACLList", () => {
      ACLStore.fetchACLs("service");
      const services = ACLStore.getACLs("service");
      expect(services instanceof ACLList).toBeTruthy();
    });

    it("returns all of the services it was given", () => {
      ACLStore.fetchACLs("service");
      const services = ACLStore.getACLs("service").getItems();
      expect(services.length).toEqual(thisAclsFixture.array.length);
    });
  });

  describe("#fetchACLSchema", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success(aclSchema);
      };
      thisAclSchema = {
        ...aclSchema
      };
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns an instance of PermissionTree", () => {
      ACLStore.fetchACLSchema();
      const permission = ACLStore.getPermissionSchema();
      expect(permission instanceof PermissionTree).toBeTruthy();
    });

    it("returns the top level permission of the tree", () => {
      ACLStore.fetchACLSchema();
      const permission = ACLStore.getPermissionSchema();
      expect(permission.name).toEqual(thisAclSchema.displayName);
    });
  });

  describe("dispatcher", () => {
    describe("ACLs", () => {
      it("stores services when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          data: [{ rid: "foo", bar: "baz" }],
          resourceType: "service"
        });

        const services = ACLStore.getACLs("service").getItems();
        expect(services[0].get("rid")).toEqual("foo");
        expect(services[0].get("bar")).toEqual("baz");
      });

      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_RESOURCE_ACLS_CHANGE,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          data: [{ rid: "foo", bar: "baz" }],
          resourceType: "service"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_RESOURCE_ACLS_ERROR,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_RESOURCE_ACLS_ERROR,
          data: "foo",
          resourceType: "service"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });
    });

    describe("ACL Schema", () => {
      it("stores schema when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SCHEMA_SUCCESS,
          data: { displayName: "foo", groupName: "bar", rid: "baz", items: [] }
        });

        const permission = ACLStore.getPermissionSchema();
        expect(permission.name).toEqual("foo");
        expect(permission.groupName).toEqual("bar");
        expect(permission.rid).toEqual("baz");
        expect(permission.getItems().length).toEqual(0);
      });

      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(EventTypes.ACL_SCHEMA_CHANGE, mockedFn);
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SCHEMA_SUCCESS,
          data: { displayName: "foo", groupName: "bar", rid: "baz", items: [] }
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(EventTypes.ACL_SCHEMA_ERROR, mockedFn);
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SCHEMA_ERROR,
          data: "foo"
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });
    });

    describe("Grant Safe User action", () => {
      ACLStore.createACLForResource = jest.fn();
      const mockData = {
        ID: "myname",
        action: "full",
        resourceID: "crazyname"
      };
      const ID = "service." + mockData.resourceID;

      beforeEach(() => {
        ACLStore.outstandingGrants = {};
      });

      it("first creates ACL for resource if nonexistent", () => {
        ACLStore.grantUserActionToResource(mockData.ID, mockData.action, ID);

        expect(ACLStore.createACLForResource).toBeCalledWith(ID, {
          description: mockData.resourceID + " service"
        });
      });

      it("adds grant request to callback list while creating ACL", () => {
        ACLStore.grantUserActionToResource(mockData.ID, mockData.action, ID);

        expect(
          typeof ACLStore.outstandingGrants[ID][0] == "function"
        ).toBeTruthy();
      });

      it("calls all actions when outstanding grant request function runs", () => {
        spyOn(ACLActions, "grantUserActionToResource");
        ACLStore.grantUserActionToResource(mockData.ID, ["foo", "bar"], ID);

        ACLStore.outstandingGrants[ID][0]();

        expect(ACLActions.grantUserActionToResource.calls.allArgs()).toEqual([
          ["myname", "foo", "service.crazyname"],
          ["myname", "bar", "service.crazyname"]
        ]);
      });

      it("executes multiple waiting grant requests upon ACL creation", () => {
        const mockedFn = jest.fn();
        const mockedFn2 = jest.fn();

        ACLStore.addOutstandingGrantRequest("service.foo", mockedFn);
        ACLStore.addOutstandingGrantRequest("service.foo", mockedFn2);

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          data: [
            { rid: "service.foo", bar: "baz" },
            { rid: "service.baz", bar: "foo" }
          ],
          resourceType: "service"
        });

        expect(
          mockedFn.mock.calls.length === 1 && mockedFn2.mock.calls.length === 1
        ).toBeTruthy();
      });

      it("only executes outstanding grant requests related to new ACL", () => {
        const mockedFn = jest.fn();
        const mockedFn2 = jest.fn();

        ACLStore.addOutstandingGrantRequest("service.foo", mockedFn);
        ACLStore.addOutstandingGrantRequest("service.baz", mockedFn2);

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          data: [{ rid: "service.foo", bar: "baz" }],
          resourceType: "service"
        });

        expect(
          mockedFn.mock.calls.length === 1 && mockedFn2.mock.calls.length === 0
        ).toBeTruthy();
      });

      it("removes outstanding grant requests when ACL creation fails", () => {
        const mockedFn = jest.fn();
        const mockedFn2 = jest.fn();

        ACLStore.addOutstandingGrantRequest("service.foo", mockedFn);
        ACLStore.addOutstandingGrantRequest("service.baz", mockedFn2);

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_CREATE_ERROR,
          resourceID: "service.foo"
        });
        expect("service.foo" in ACLStore.outstandingGrants).toBeFalsy();
        expect(ACLStore.outstandingGrants["service.baz"].length).toEqual(1);
      });
    });

    describe("Grant User action", () => {
      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_USER_GRANT_ACTION_CHANGE,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
          triple: { userID: "foo", action: "full", resourceID: "marathon" }
        });

        expect(mockedFn.mock.calls[0][0]).toEqual({
          userID: "foo",
          action: "full",
          resourceID: "marathon"
        });
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_USER_GRANT_ACTION_ERROR,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_GRANT_ACTION_ERROR,
          data: "bar",
          triple: { userID: "foo", action: "full", resourceID: "marathon" },
          xhr: { data: "foo" }
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          "bar",
          { userID: "foo", action: "full", resourceID: "marathon" },
          { data: "foo" }
        ]);
      });
    });

    describe("Revoke User action", () => {
      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_USER_REVOKE_ACTION_CHANGE,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
          triple: { userID: "foo", action: "full", resourceID: "marathon" }
        });

        expect(mockedFn.mock.calls[0][0]).toEqual({
          userID: "foo",
          action: "full",
          resourceID: "marathon"
        });
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_USER_REVOKE_ACTION_ERROR,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
          data: "bar",
          triple: { userID: "foo", action: "full", resourceID: "marathon" }
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          "bar",
          { userID: "foo", action: "full", resourceID: "marathon" }
        ]);
      });
    });

    describe("Grant Group action", () => {
      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_GROUP_GRANT_ACTION_CHANGE,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
          triple: { groupID: "foo", action: "full", resourceID: "marathon" }
        });

        expect(mockedFn.mock.calls[0][0]).toEqual({
          groupID: "foo",
          action: "full",
          resourceID: "marathon"
        });
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_GROUP_GRANT_ACTION_ERROR,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
          data: "bar",
          triple: { groupID: "foo", action: "full", resourceID: "marathon" },
          xhr: { data: "foo" }
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          "bar",
          { groupID: "foo", action: "full", resourceID: "marathon" },
          { data: "foo" }
        ]);
      });
    });

    describe("Revoke Group action", () => {
      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_GROUP_REVOKE_ACTION_CHANGE,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
          triple: { groupID: "foo", action: "full", resourceID: "marathon" }
        });

        expect(mockedFn.mock.calls[0][0]).toEqual({
          groupID: "foo",
          action: "full",
          resourceID: "marathon"
        });
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        ACLStore.addChangeListener(
          EventTypes.ACL_GROUP_REVOKE_ACTION_ERROR,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
          data: "bar",
          triple: { groupID: "foo", action: "full", resourceID: "marathon" }
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          "bar",
          { groupID: "foo", action: "full", resourceID: "marathon" }
        ]);
      });
    });
  });
});
