import ACLServiceAccountActions from "../../actions/ACLServiceAccountActions";
import ServiceAccount from "../../structs/ServiceAccount";
import ServiceAccountList from "../../structs/ServiceAccountList";
import * as EventTypes from "../../constants/EventTypes";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);
const getACLServiceAccountsStore = require("../ACLServiceAccountsStore")
  .default;
import * as ActionTypes from "../../constants/ActionTypes";
const OrganizationReducer = require("../../../../Reducer");

const ACLServiceAccountsStore = getACLServiceAccountsStore();

PluginSDK.__addReducer("organization", OrganizationReducer);

let thisFetchAll;

describe("ACLServiceAccountsStore", () => {
  beforeEach(() => {
    const serviceAccounts = [];
    const serviceAccountsDetails = {};
    const serviceAccountsFetching = {};
    // Reset state.serviceAccounts
    SDK.dispatch({
      type: EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE,
      serviceAccounts
    });
    // Reset state.serviceAccountsDetail
    SDK.dispatch({
      type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
      serviceAccounts: serviceAccountsDetails
    });
    // Reset state.serviceAccountsFetching
    SDK.dispatch({
      type: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCH_START,
      serviceAccountsFetching
    });
  });

  describe("#getServiceAccounts", () => {
    it("returns the serviceAccounts", () => {
      const serviceAccounts = [{ bar: "baz" }, { baz: "bar" }];
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE,
        serviceAccounts
      });

      expect(
        ACLServiceAccountsStore.getServiceAccounts() instanceof
          ServiceAccountList
      ).toBe(true);

      expect(
        ACLServiceAccountsStore.getServiceAccounts()
          .getItems()[0]
          .get()
      ).toEqual(serviceAccounts[0]);
    });
  });

  describe("#getServiceAccountsDetail", () => {
    it("returns the serviceAccountsDetail", () => {
      const serviceAccounts = {
        foo: {
          bar: "baz"
        },
        foobar: {
          baz: "bar"
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
        serviceAccounts
      });

      expect(ACLServiceAccountsStore.getServiceAccountsDetail()).toEqual(
        serviceAccounts
      );
    });
  });

  describe("#getServiceAccountsFetching", () => {
    it("returns the serviceAccountsDetail", () => {
      const serviceAccountsFetching = {
        foo: {
          groups: true,
          permissions: true,
          serviceAccount: true
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCH_START,
        serviceAccountsFetching
      });

      expect(ACLServiceAccountsStore.getServiceAccountsFetching()).toEqual(
        serviceAccountsFetching
      );
    });
  });

  describe("#getServiceAccountRaw", () => {
    it("returns {} if ServiceAccount does not exist", () => {
      const serviceAccounts = {
        foo: {
          bar: "baz"
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
        serviceAccounts
      });

      expect(ACLServiceAccountsStore.getServiceAccountRaw("foobar")).toEqual(
        {}
      );
    });

    it("returns the serviceAccount requested", () => {
      const serviceAccounts = {
        foo: {
          bar: "baz"
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
        serviceAccounts
      });

      expect(ACLServiceAccountsStore.getServiceAccountRaw("foo")).toEqual({
        bar: "baz"
      });
    });
  });

  describe("#getServiceAccount", () => {
    it("returns null if ServiceAccount does not exist", () => {
      const serviceAccounts = {
        foo: {
          bar: "baz"
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
        serviceAccounts
      });

      expect(ACLServiceAccountsStore.getServiceAccount("foobar")).toEqual(null);
    });

    it("returns the serviceAccount requested", () => {
      const serviceAccounts = {
        foo: {
          bar: "baz"
        }
      };
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
        serviceAccounts
      });

      expect(ACLServiceAccountsStore.getServiceAccount("foo").get()).toEqual({
        bar: "baz"
      });

      expect(
        ACLServiceAccountsStore.getServiceAccount("foo") instanceof
          ServiceAccount
      ).toBeTruthy();
    });
  });

  describe("#setServiceAccount", () => {
    it("sets serviceAccount", () => {
      ACLServiceAccountsStore.setServiceAccount("foo", { bar: "baz" });

      expect(ACLServiceAccountsStore.getServiceAccountsDetail()).toEqual({
        foo: { bar: "baz" }
      });
    });
  });

  describe("#fetchServiceAccountWithDetails", () => {
    beforeEach(() => {
      spyOn(ACLServiceAccountActions, "fetch");
      spyOn(ACLServiceAccountActions, "fetchGroups");
      spyOn(ACLServiceAccountActions, "fetchPermissions");
    });

    it("tracks serviceAccount as fetching", () => {
      ACLServiceAccountsStore.fetchServiceAccountWithDetails("foo");

      expect(ACLServiceAccountsStore.getServiceAccountsFetching()).toEqual({
        foo: {
          serviceAccount: false,
          groups: false,
          permissions: false
        }
      });
    });

    it("calls APIs to fetch serviceAccounts details", () => {
      ACLServiceAccountsStore.fetchServiceAccountWithDetails("foo");

      expect(ACLServiceAccountActions.fetch).toHaveBeenCalled();
      expect(ACLServiceAccountActions.fetchGroups).toHaveBeenCalled();
      expect(ACLServiceAccountActions.fetchPermissions).toHaveBeenCalled();
    });
  });

  describe("dispatcher", () => {
    beforeEach(() => {
      const serviceAccounts = [];
      const serviceAccountsDetails = {};
      const serviceAccountsFetching = {};
      // Reset state.serviceAccounts
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE,
        serviceAccounts
      });
      // Reset state.serviceAccountsDetail
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
        serviceAccounts: serviceAccountsDetails
      });
      // Reset state.serviceAccountsFetching
      SDK.dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCH_START,
        serviceAccountsFetching
      });
    });

    describe("add", () => {
      beforeEach(() => {
        thisFetchAll = ACLServiceAccountsStore.fetchAll;
        ACLServiceAccountsStore.fetchAll = jest.fn();
      });

      afterEach(() => {
        ACLServiceAccountsStore.fetchAll = thisFetchAll;
      });

      it("invokes fetchAll upon success", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
          serviceAccountID: "foo"
        });

        expect(ACLServiceAccountsStore.fetchAll.mock.calls.length).toEqual(1);
      });

      it("emits event after success event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
          data: { uid: "foo" },
          serviceAccountID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_CREATE_ERROR,
          (error, id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_ERROR,
          serviceAccountID: "foo"
        });
      });
    });

    describe("delete", () => {
      beforeEach(() => {
        thisFetchAll = ACLServiceAccountsStore.fetchAll;
        ACLServiceAccountsStore.fetchAll = jest.fn();
      });

      afterEach(() => {
        ACLServiceAccountsStore.fetchAll = thisFetchAll;
      });

      it("invokes fetchAll upon success", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_DELETE_SUCCESS,
          serviceAccountID: "foo"
        });

        expect(ACLServiceAccountsStore.fetchAll.mock.calls.length).toEqual(1);
      });

      it("emits event after success event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DELETE_SUCCESS,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_DELETE_SUCCESS,
          data: { uid: "foo" },
          serviceAccountID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DELETE_ERROR,
          (error, id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_DELETE_ERROR,
          serviceAccountID: "foo"
        });
      });
    });

    describe("fetch", () => {
      it("stores serviceAccount when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_SUCCESS,
          data: { uid: "foo", bar: "baz" }
        });

        expect(ACLServiceAccountsStore.getServiceAccountRaw("foo")).toEqual({
          uid: "foo",
          bar: "baz"
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_SERVICE_ACCOUNT_CHANGE,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_SUCCESS,
          data: { uid: "foo" }
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_SERVICE_ACCOUNT_ERROR,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_ERROR,
          serviceAccountID: "foo"
        });
      });
    });

    describe("fetchAll", () => {
      it("stores serviceAccounts when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNTS_SUCCESS,
          data: [{ uid: "foo", bar: "baz" }]
        });

        expect(
          ACLServiceAccountsStore.getServiceAccounts()
            .getItems()[0]
            .get()
        ).toEqual({ uid: "foo", bar: "baz" });
      });

      it("emits event after success event is dispatched", () => {
        const mockFn = jest.fn();
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNTS_SUCCESS,
          data: [{ uid: "foo" }]
        });

        expect(mockFn.mock.calls.length).toEqual(1);
      });

      it("emits event after error event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNTS_ERROR,
          (error, id) => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNTS_ERROR,
          serviceAccountID: "foo"
        });
      });
    });

    describe("groups", () => {
      it("stores groups when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_SUCCESS,
          data: { bar: "baz" },
          serviceAccountID: "foo"
        });

        expect(ACLServiceAccountsStore.getServiceAccountRaw("foo")).toEqual({
          groups: { bar: "baz" }
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_GROUPS_CHANGE,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_SUCCESS,
          serviceAccountID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_GROUPS_ERROR,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_ERROR,
          serviceAccountID: "foo"
        });
      });
    });

    describe("permissions", () => {
      it("stores permissions when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_SUCCESS,
          data: { bar: "baz" },
          serviceAccountID: "foo"
        });

        expect(ACLServiceAccountsStore.getServiceAccountRaw("foo")).toEqual({
          permissions: { bar: "baz" }
        });
      });

      it("emits event after success event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_PERMISSIONS_CHANGE,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_SUCCESS,
          serviceAccountID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_PERMISSIONS_ERROR,
          id => {
            expect(id).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_ERROR,
          serviceAccountID: "foo"
        });
      });
    });

    describe("update", () => {
      beforeEach(() => {
        thisFetchAll = ACLServiceAccountsStore.fetchAll;
        ACLServiceAccountsStore.fetchAll = jest.fn();
      });

      afterEach(() => {
        ACLServiceAccountsStore.fetchAll = thisFetchAll;
      });

      it("invokes fetchAll upon success", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
          serviceAccountID: "foo"
        });

        expect(ACLServiceAccountsStore.fetchAll.mock.calls.length).toEqual(1);
      });

      it("emits event after success event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS
        });
      });

      it("emits success event with the serviceAccountID", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
          serviceAccountID => {
            expect(serviceAccountID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
          serviceAccountID: "foo"
        });
      });

      it("emits event after error event is dispatched", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
          () => {
            expect(true).toEqual(true);
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_ERROR
        });
      });

      it("emits error event with the serviceAccountID", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
          (data, serviceAccountID) => {
            expect(serviceAccountID).toEqual("foo");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
          data: "bar",
          serviceAccountID: "foo"
        });
      });

      it("emits error event with the error message", () => {
        ACLServiceAccountsStore.addChangeListener(
          EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
          error => {
            expect(error).toEqual("bar");
          }
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
          data: "bar",
          serviceAccountID: "foo"
        });
      });
    });
  });
});
