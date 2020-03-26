import * as EventTypes from "../../constants/EventTypes";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const ACLUsersActions = require("../../actions/ACLUsersActions").default;
const ACLUserStore = require("../ACLUserStore").default;
const User = require("../../structs/User").default;
import * as ActionTypes from "../../constants/ActionTypes";
const OrganizationReducer = require("../../../../Reducer");

PluginSDK.__addReducer("organization", OrganizationReducer);

describe("ACLUserStore", () => {
  beforeEach(() => {
    const users = {};
    const usersFetching = {};

    SDK.dispatch({
      type: EventTypes.ACL_USER_SET_USER,
      users,
    });
    SDK.dispatch({
      type: EventTypes.ACL_USER_DETAILS_FETCH_START,
      usersFetching,
    });
  });

  describe("#getUserRaw", () => {
    it("returns the user that was set", () => {
      const users = { foo: { bar: "baz" } };
      SDK.dispatch({
        type: EventTypes.ACL_USER_SET_USER,
        users,
      });
      expect(ACLUserStore.getUserRaw("foo")).toEqual({ bar: "baz" });
    });
  });

  describe("#getUser", () => {
    it("returns the user that was set", () => {
      const users = { foo: { bar: "baz" } };
      SDK.dispatch({
        type: EventTypes.ACL_USER_SET_USER,
        users,
      });
      expect(ACLUserStore.getUser("foo") instanceof User).toBeTruthy();
    });

    it("returns the correct user data", () => {
      const users = { foo: { bar: "baz" } };
      SDK.dispatch({
        type: EventTypes.ACL_USER_SET_USER,
        users,
      });
      expect(ACLUserStore.getUser("foo").get()).toEqual({ bar: "baz" });
    });
  });

  describe("#setUser", () => {
    it("sets user", () => {
      ACLUserStore.setUser("foo", { bar: "baz" });
      expect(ACLUserStore.get("userDetail")).toEqual({ foo: { bar: "baz" } });
    });
  });

  describe("#fetchUserWithDetails", () => {
    beforeEach(() => {
      spyOn(ACLUsersActions, "fetchUser");
      spyOn(ACLUsersActions, "fetchUserGroups");
      spyOn(ACLUsersActions, "fetchUserPermissions");
    });

    it("tracks user as fetching", () => {
      ACLUserStore.fetchUserWithDetails("foo");
      expect(ACLUserStore.get("usersFetching")).toEqual({
        foo: {
          user: false,
          groups: false,
          permissions: false,
        },
      });
    });

    it("calls necessary APIs to fetch users details", () => {
      ACLUserStore.fetchUserWithDetails("foo");
      expect(ACLUsersActions.fetchUser).toHaveBeenCalled();
      expect(ACLUsersActions.fetchUserGroups).toHaveBeenCalled();
      expect(ACLUsersActions.fetchUserPermissions).toHaveBeenCalled();
    });
  });

  describe("dispatcher", () => {
    afterEach(() => {
      ACLUserStore.removeAllListeners();
    });

    describe("user", () => {
      it("stores user when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_SUCCESS,
          data: { uid: "foo", bar: "baz" },
        });

        expect(ACLUserStore.getUserRaw("foo")).toEqual({
          uid: "foo",
          bar: "baz",
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_DETAILS_USER_CHANGE,
          (id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_SUCCESS,
          data: { uid: "foo" },
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_DETAILS_USER_ERROR,
          (id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_ERROR,
          userID: "foo",
        });
      });
    });

    describe("groups", () => {
      it("stores groups when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_GROUPS_SUCCESS,
          data: { bar: "baz" },
          userID: "foo",
        });

        expect(ACLUserStore.getUserRaw("foo")).toEqual({
          groups: { bar: "baz" },
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_DETAILS_GROUPS_CHANGE,
          (id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_GROUPS_SUCCESS,
          userID: "foo",
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_DETAILS_GROUPS_ERROR,
          (id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_GROUPS_ERROR,
          userID: "foo",
        });
      });
    });

    describe("permissions", () => {
      it("stores permissions when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_PERMISSIONS_SUCCESS,
          data: { bar: "baz" },
          userID: "foo",
        });

        expect(ACLUserStore.getUserRaw("foo")).toEqual({
          permissions: { bar: "baz" },
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_DETAILS_PERMISSIONS_CHANGE,
          (id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_PERMISSIONS_SUCCESS,
          userID: "foo",
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_DETAILS_PERMISSIONS_ERROR,
          (id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_PERMISSIONS_ERROR,
          userID: "foo",
        });
      });
    });

    describe("update", () => {
      it("emits event after success event is dispatched", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_UPDATE_SUCCESS,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_UPDATE_SUCCESS,
        });
      });

      it("emits success event with the userID", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_UPDATE_SUCCESS,
          (userID) => {
            expect(userID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_UPDATE_SUCCESS,
          userID: "foo",
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLUserStore.addChangeListener(EventTypes.ACL_USER_UPDATE_ERROR, () => {
          expect(true).toEqual(true);
        });

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_UPDATE_ERROR,
        });
      });

      it("emits error event with the userID", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_UPDATE_ERROR,
          (data, userID) => {
            expect(userID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_UPDATE_ERROR,
          data: "bar",
          userID: "foo",
        });
      });

      it("emits error event with the error message", () => {
        ACLUserStore.addChangeListener(
          EventTypes.ACL_USER_UPDATE_ERROR,
          (error) => {
            expect(error).toEqual("bar");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_USER_UPDATE_ERROR,
          data: "bar",
          userID: "foo",
        });
      });
    });
  });
});
