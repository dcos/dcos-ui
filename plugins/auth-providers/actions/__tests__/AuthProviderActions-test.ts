import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("auth-providers", { enabled: true });
require("../../SDK").setSDK(SDK);

const AuthProviderActions = require("../AuthProviderActions").default;
import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration;

describe("AuthProviderActions", () => {
  describe("#fetchAll", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
    });

    it("dispatches the correct action when successful", () => {
      AuthProviderActions.fetchAll();
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PROVIDERS_SUCCESS);
      });
      const callLength = RequestUtil.json.calls.all().length;
      RequestUtil.json.calls
        .all()
        [callLength - 2].args[0].success({ foo: "bar" });
      RequestUtil.json.calls
        .all()
        [callLength - 1].args[0].success({ foo: "bar" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      AuthProviderActions.fetchAll();
      const callLength = RequestUtil.json.calls.all().length;
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PROVIDERS_ERROR);
      });

      RequestUtil.json.calls.all()[callLength - 1].args[0].error({
        responseJSON: { description: "bar" },
      });
    });

    it("fetches data from the correct URL", () => {
      AuthProviderActions.fetchAll();
      const callLength = RequestUtil.json.calls.all().length;
      expect(RequestUtil.json.calls.all()[callLength - 2].args[0].url).toEqual(
        `${Config.rootUrl}${Config.acsAPIPrefix}/auth/oidc/providers`
      );
      expect(RequestUtil.json.calls.all()[callLength - 1].args[0].url).toEqual(
        `${Config.rootUrl}${Config.acsAPIPrefix}/auth/saml/providers`
      );
    });
  });

  describe("#fetch", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      AuthProviderActions.fetch("oidc", "foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PROVIDER_SUCCESS);
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches with the providerID when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PROVIDER_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("fetches data from the correct URL", () => {
      const providerID = "odic-foo";
      AuthProviderActions.fetch("oidc", providerID);
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        `${Config.rootUrl}${
          Config.acsAPIPrefix
        }/auth/oidc/providers/${encodeURIComponent(providerID)}`
      );
    });
  });

  describe("#create", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      AuthProviderActions.create("oidc", "foo", {
        providerID: "foo",
        description: "bar",
      });
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PROVIDER_CREATE_SUCCESS
        );
      });

      thisConfiguration.success({ providerID: "foo", description: "bar" });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.data).toEqual({ providerID: "foo", description: "bar" });
      });

      thisConfiguration.success({ providerID: "foo", description: "bar" });
    });

    it("dispatches with the providerID when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PROVIDER_CREATE_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("uses PUT for the request method", () => {
      expect(thisConfiguration.method).toEqual("PUT");
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the providerID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#update", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      AuthProviderActions.update("oidc", "foo", {
        providerID: "foo",
        description: "bar",
      });
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PROVIDER_UPDATE_SUCCESS
        );
      });

      thisConfiguration.success({ providerID: "foo", description: "bar" });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
        expect(action.providerType).toEqual("oidc");
      });

      thisConfiguration.success({ providerID: "foo", description: "bar" });
    });

    it("dispatches with the providerID when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PROVIDER_UPDATE_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("uses PATCH for the request method", () => {
      expect(thisConfiguration.method).toEqual("PATCH");
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the providerID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#delete", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      AuthProviderActions.delete("oidc", "foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PROVIDER_DELETE_SUCCESS
        );
      });

      thisConfiguration.success({ providerID: "foo", description: "bar" });
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.data).toEqual({ providerID: "foo", description: "bar" });
      });

      thisConfiguration.success({ providerID: "foo", description: "bar" });
    });

    it("dispatches with the providerID when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PROVIDER_DELETE_ERROR);
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("uses DELETE for the request method", () => {
      expect(thisConfiguration.method).toEqual("DELETE");
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.data).toEqual("bar");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("dispatches with the providerID when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });
  });

  describe("#fetchCallbackURL", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      AuthProviderActions.fetchCallbackURL("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PROVIDER_CALLBACK_URL_SUCCESS
        );
      });

      thisConfiguration.success({ foo: "bar" });
    });

    it("dispatches with the providerID when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.providerID).toEqual("foo");
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PROVIDER_CALLBACK_URL_ERROR
        );
      });

      thisConfiguration.error({ responseJSON: { description: "bar" } });
    });

    it("fetches data from the correct URL", () => {
      const providerID = "odic-foo";
      AuthProviderActions.fetchCallbackURL(providerID);
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        `${Config.rootUrl}${Config.acsAPIPrefix}/auth/saml/providers/${providerID}/acs-callback-url`
      );
    });
  });
});
