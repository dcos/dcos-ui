import Group from "../../structs/Group";
import ServiceAccount from "../../../service-accounts/structs/ServiceAccount";
import User from "../../../users/structs/User";
import * as EventTypes from "../../constants/EventTypes";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const ACLGroupsActions = require("../../actions/ACLGroupsActions").default;
const ACLGroupStore = require("../ACLGroupStore").default;
import * as ActionTypes from "../../constants/ActionTypes";
const OrganizationReducer = require("../../../../Reducer");

PluginTestUtils.addReducer("organization", OrganizationReducer);

describe("ACLGroupStore", () => {
  beforeEach(() => {
    const groups = {};
    const groupsFetching = {};

    SDK.dispatch({
      type: EventTypes.ACL_GROUP_SET_GROUPS,
      groups
    });
    SDK.dispatch({
      type: EventTypes.ACL_GROUP_SET_GROUPS_FETCHING,
      groupsFetching
    });
  });

  describe("#getGroupRaw", () => {
    it("returns the group that was set", () => {
      const groups = { foo: { bar: "baz" } };
      SDK.dispatch({
        type: EventTypes.ACL_GROUP_SET_GROUPS,
        groups
      });
      expect(ACLGroupStore.getGroupRaw("foo")).toEqual({ bar: "baz" });
    });
  });

  describe("#getGroup", () => {
    it("returns an instance of Group", () => {
      const groups = { foo: { bar: "baz" } };
      SDK.dispatch({
        type: EventTypes.ACL_GROUP_SET_GROUPS,
        groups
      });
      expect(ACLGroupStore.getGroup("foo") instanceof Group).toBeTruthy();
    });

    it("returns the correct group data", () => {
      const groups = { foo: { bar: "baz" } };
      SDK.dispatch({
        type: EventTypes.ACL_GROUP_SET_GROUPS,
        groups
      });
      expect(ACLGroupStore.getGroup("foo").get()).toEqual({ bar: "baz" });
    });
  });

  describe("#getServiceAccounts", () => {
    beforeEach(() => {
      const groups = {
        foo: {
          bar: "baz",
          serviceAccounts: [
            {
              user: {
                description: "service_account"
              }
            },
            {
              user: {
                description: "A service account"
              }
            }
          ]
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_GROUP_SET_GROUPS,
        groups
      });
    });

    it("returns an array of ServiceAccounts", () => {
      expect(
        ACLGroupStore.getServiceAccounts("foo").getItems()[0] instanceof
          ServiceAccount
      ).toBeTruthy();
    });

    it("returns an array of length 2", () => {
      expect(ACLGroupStore.getServiceAccounts("foo").getItems().length).toEqual(
        2
      );
    });
  });

  describe("#getUsers", () => {
    beforeEach(() => {
      const groups = {
        foo: {
          bar: "baz",
          users: [
            {
              user: {
                description: "A user"
              }
            },
            {
              user: {
                description: "Another user"
              }
            }
          ]
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_GROUP_SET_GROUPS,
        groups
      });
    });

    it("returns an array of Users", () => {
      expect(ACLGroupStore.getUsers("foo")[0] instanceof User).toBeTruthy();
    });

    it("returns an array of length 2", () => {
      expect(ACLGroupStore.getUsers("foo").length).toEqual(2);
    });
  });

  describe("#setGroup", () => {
    it("sets group", () => {
      ACLGroupStore.setGroup("foo", { bar: "baz" });
      expect(ACLGroupStore.get("groupDetail")).toEqual({ foo: { bar: "baz" } });
    });
  });

  describe("#fetchGroupWithDetails", () => {
    beforeEach(() => {
      spyOn(ACLGroupsActions, "fetchGroup");
      spyOn(ACLGroupsActions, "fetchGroupUsers");
      spyOn(ACLGroupsActions, "fetchGroupPermissions");
    });

    it("tracks group as fetching", () => {
      ACLGroupStore.fetchGroupWithDetails("foo");
      expect(ACLGroupStore.get("groupsFetching")).toEqual({
        foo: {
          group: false,
          users: false,
          permissions: false,
          serviceAccounts: false
        }
      });
    });

    it("calls necessary APIs to fetch groups details", () => {
      ACLGroupStore.fetchGroupWithDetails("foo");
      expect(ACLGroupsActions.fetchGroup).toHaveBeenCalled();
      expect(ACLGroupsActions.fetchGroupUsers).toHaveBeenCalled();
      expect(ACLGroupsActions.fetchGroupPermissions).toHaveBeenCalled();
    });
  });

  describe("dispatcher", () => {
    afterEach(() => {
      ACLGroupStore.removeAllListeners();
    });

    describe("group", () => {
      it("stores group when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_SUCCESS,
          data: { gid: "foo", bar: "baz" }
        });

        expect(ACLGroupStore.getGroupRaw("foo")).toEqual({
          gid: "foo",
          bar: "baz"
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DETAILS_GROUP_CHANGE,
          groupID => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_SUCCESS,
          data: { gid: "foo" }
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DETAILS_GROUP_ERROR,
          (data, groupID) => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_ERROR,
          groupID: "foo"
        });
      });
    });

    describe("users", () => {
      it("stores users when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_USERS_SUCCESS,
          data: { bar: "baz" },
          groupID: "foo"
        });

        expect(ACLGroupStore.getGroupRaw("foo")).toEqual({
          users: { bar: "baz" }
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DETAILS_GROUP_CHANGE,
          groupID => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_USERS_SUCCESS,
          groupID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DETAILS_USERS_ERROR,
          (data, groupID) => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_USERS_ERROR,
          groupID: "foo"
        });
      });
    });

    describe("permissions", () => {
      it("stores permissions when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_PERMISSIONS_SUCCESS,
          data: { bar: "baz" },
          groupID: "foo"
        });

        expect(ACLGroupStore.getGroupRaw("foo")).toEqual({
          permissions: { bar: "baz" }
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DETAILS_PERMISSIONS_CHANGE,
          groupID => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_PERMISSIONS_SUCCESS,
          groupID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DETAILS_PERMISSIONS_ERROR,
          (data, groupID) => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_PERMISSIONS_ERROR,
          groupID: "foo",
          data: "bar"
        });
      });
    });

    describe("create", () => {
      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_CREATE_SUCCESS,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_CREATE_SUCCESS
        });
      });

      it("emits success event with the groupID", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_CREATE_SUCCESS,
          groupID => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_CREATE_SUCCESS,
          groupID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_CREATE_ERROR,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_CREATE_ERROR
        });
      });

      it("emits error event with the groupID", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_CREATE_ERROR,
          (data, groupID) => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_CREATE_ERROR,
          groupID: "foo",
          data: "bar"
        });
      });
    });

    describe("update", () => {
      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_UPDATE_SUCCESS,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_UPDATE_SUCCESS
        });
      });

      it("emits success event with the groupID", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_UPDATE_SUCCESS,
          groupID => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_UPDATE_SUCCESS,
          groupID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_UPDATE_ERROR,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_UPDATE_ERROR
        });
      });

      it("emits error event with the groupID", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_UPDATE_ERROR,
          (data, groupID) => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_UPDATE_ERROR,
          groupID: "foo",
          data: "bar"
        });
      });

      it("emits error event with the groupID and error message", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_UPDATE_ERROR,
          (error, groupID) => {
            expect(groupID).toEqual("foo");
            expect(error).toEqual("bar");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_UPDATE_ERROR,
          groupID: "foo",
          data: "bar"
        });
      });
    });

    describe("delete", () => {
      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DELETE_SUCCESS,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_DELETE_SUCCESS
        });
      });

      it("emits success event with the groupID", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DELETE_SUCCESS,
          groupID => {
            expect(groupID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_DELETE_SUCCESS,
          groupID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DELETE_ERROR,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_DELETE_ERROR
        });
      });

      it("emits error event with the groupID and error", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_DELETE_ERROR,
          (error, groupID) => {
            expect(groupID).toEqual("foo");
            expect(error).toEqual("error");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_DELETE_ERROR,
          groupID: "foo",
          data: "error"
        });
      });
    });

    describe("adding user", () => {
      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_USERS_CHANGED,
          (...args) => {
            expect([].slice.call(args)).toEqual(["foo", "bar"]);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_ADD_USER_SUCCESS,
          groupID: "foo",
          userID: "bar"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_ADD_USER_ERROR,
          (...args) => {
            expect([].slice.call(args)).toEqual(["error", "foo", "bar"]);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_ADD_USER_ERROR,
          data: "error",
          groupID: "foo",
          userID: "bar"
        });
      });
    });

    describe("remove user", () => {
      it("emits event after success event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_USERS_CHANGED,
          (...args) => {
            expect([].slice.call(args)).toEqual(["foo", "bar"]);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_SUCCESS,
          groupID: "foo",
          userID: "bar"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLGroupStore.addChangeListener(
          EventTypes.ACL_GROUP_REMOVE_USER_ERROR,
          (...args) => {
            expect([].slice.call(args)).toEqual(["error", "foo", "bar"]);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_ERROR,
          data: "error",
          groupID: "foo",
          userID: "bar"
        });
      });
    });
  });
});
