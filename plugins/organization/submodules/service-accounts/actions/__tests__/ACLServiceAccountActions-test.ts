import ACLServiceAccountActions from "../ACLServiceAccountActions";

import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration;

describe("ACLServiceAccountActions", () => {
  describe("#add", () => {
    describe("when keyMethod is 'manual'", () => {
      beforeEach(() => {
        spyOn(RequestUtil, "json");
        ACLServiceAccountActions.add({ uid: "foo", keyMethod: "manual" });
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
      });

      it("calls #json from the RequestUtil", () => {
        expect(RequestUtil.json).toHaveBeenCalled();
      });

      it("fetches data from the correct URL", () => {
        expect(thisConfiguration.url).toEqual(
          Config.acsAPIPrefix + "/users/foo"
        );
      });

      it("encodes characters for URL", () => {
        ACLServiceAccountActions.add({ uid: "foo@bar" });
        thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

        expect(thisConfiguration.url).toEqual(
          Config.acsAPIPrefix + "/users/foo%40bar"
        );
      });

      it("uses PUT for the request method", () => {
        expect(thisConfiguration.method).toEqual("PUT");
      });

      it("dispatches the correct action when successful", () => {
        const unsubscribe = SDK.onDispatch(action => {
          unsubscribe();

          expect(action.type).toEqual(
            ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS
          );
        });

        thisConfiguration.success({ foo: "bar" });
      });

      it("dispatches the serviceAccountID when successful", () => {
        const unsubscribe = SDK.onDispatch(action => {
          unsubscribe();

          expect(action.serviceAccountID).toEqual("foo");
        });

        thisConfiguration.success({ description: "bar" });
      });

      it("dispatches the correct action when unsuccessful", () => {
        const unsubscribe = SDK.onDispatch(action => {
          unsubscribe();

          expect(action.type).toEqual(
            ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_ERROR
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

      it("dispatches the serviceAccountID when unsuccessful", () => {
        const unsubscribe = SDK.onDispatch(action => {
          unsubscribe();

          expect(action.serviceAccountID).toEqual("foo");
        });

        thisConfiguration.error({ responseJSON: { description: "bar" } });
      });

      it("dispatches the xhr when unsuccessful", () => {
        const unsubscribe = SDK.onDispatch(action => {
          unsubscribe();

          expect(action.xhr).toEqual({
            foo: "bar",
            responseJSON: { description: "baz" }
          });
        });

        thisConfiguration.error({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });
    });

    describe("when keyMethod is 'auto-generate' and service account succeeds", () => {
      let secretConfiguration;

      beforeEach(() => {
        spyOn(RequestUtil, "json");
        ACLServiceAccountActions.add({
          uid: "foo",
          public_key: "BEGIN PUBLIC KEY\nABCD1234\nEND PUBLIC KEY",
          key_method: "auto-generate",
          secret_path: "my/secret",
          private_key: "BEGIN PRIVATE KEY\nABCD1234\nEND PRIVATE KEY"
        });
        thisConfiguration = RequestUtil.json.calls.all()[0].args[0];
        thisConfiguration.success({ foor: "bar" });
        secretConfiguration = RequestUtil.json.calls.all()[1].args[0];
      });

      it("dispatches the success action when secret succeeds", () => {
        const unsubscribe = SDK.onDispatch(action => {
          unsubscribe();

          expect(action.type).toEqual(
            ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS
          );
        });

        secretConfiguration.success({ foo: "bar" });
      });

      it("transmits public key to service account endpoint", () => {
        expect(thisConfiguration.data.public_key).toMatch(/BEGIN PUBLIC KEY/);
      });

      it("transmits secret data to default secret store", () => {
        expect(secretConfiguration.data).toEqual({
          store_id: "default",
          path: "my/secret",
          value: JSON.stringify({
            login_endpoint: "https://leader.mesos/acs/api/v1/auth/login",
            schema: "RS256",
            private_key: "BEGIN PRIVATE KEY\nABCD1234\nEND PRIVATE KEY",
            uid: "foo"
          })
        });
      });
    });
  });

  describe("#delete", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLServiceAccountActions.delete("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(Config.acsAPIPrefix + "/users/foo");
    });

    it("encodes characters for URL", () => {
      ACLServiceAccountActions.delete("foo@bar");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];

      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/users/foo%40bar"
      );
    });

    it("uses DELETE for the request method", () => {
      expect(thisConfiguration.method).toEqual("DELETE");
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_DELETE_SUCCESS
        );
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the serviceAccountID when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_DELETE_ERROR
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

    it("dispatches the serviceAccountID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetch", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLServiceAccountActions.fetch("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_SUCCESS
        );
      });
      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual({ bar: "baz" });
      });
      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_ERROR
        );
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual("bar");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the serviceAccountID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchAll", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLServiceAccountActions.fetchAll();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNTS_SUCCESS
        );
      });
      thisConfiguration.success({ array: [{ bar: "baz" }] });
    });

    it("dispatches the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual([{ bar: "baz" }]);
      });
      thisConfiguration.success({ array: [{ bar: "baz" }] });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNTS_ERROR
        );
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual("bar");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchGroups", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLServiceAccountActions.fetchGroups("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_SUCCESS
        );
      });
      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual({ bar: "baz" });
      });
      thisConfiguration.success({ array: { bar: "baz" } });
    });

    it("dispatches the serviceAccountID successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });
      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_ERROR
        );
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.serviceAccountID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the serviceAccountID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual("bar");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchPermissions", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLServiceAccountActions.fetchPermissions("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_SUCCESS
        );
      });
      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual({ bar: "baz" });
      });
      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the serviceAccountID successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });
      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_ERROR
        );
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the serviceAccountID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.data).toEqual("bar");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#update", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLServiceAccountActions.update("foo");
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
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS
        );
      });
      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches the serviceAccountID when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.type).toEqual(
          ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_ERROR
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

    it("dispatches the serviceAccountID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();

        expect(action.serviceAccountID).toEqual("foo");
      });
      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });
});
