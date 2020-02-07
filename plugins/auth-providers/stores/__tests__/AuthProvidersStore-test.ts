import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("auth-providers", { enabled: true });
require("../../SDK").setSDK(SDK);

const List = require("#SRC/js/structs/List").default;
const AuthProvider = require("../../structs/AuthProvider").default;
const AuthProvidersStore = require("../AuthProvidersStore").default;
import * as ActionTypes from "../../constants/ActionTypes";
import * as EventTypes from "../../constants/EventTypes";
const AuthProviderReducer = require("../../Reducer");

PluginTestUtils.addReducer("auth-providers", AuthProviderReducer);

describe("AuthProvidersStore", () => {
  describe("#getProvider", () => {
    beforeEach(() => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_PROVIDERS_SUCCESS,
        data: {
          oidc: {
            foo: "foo description",
            bar: "bar description"
          },
          saml: {}
        }
      });
    });

    it("returns instance of List", () => {
      expect(AuthProvidersStore.getProviders() instanceof List).toBeTruthy();
    });

    it("returns an instance of AuthProvider for all list items", () => {
      expect(
        AuthProvidersStore.getProviders().getItems()[0] instanceof AuthProvider
      ).toBeTruthy();

      expect(
        AuthProvidersStore.getProviders().getItems()[1] instanceof AuthProvider
      ).toBeTruthy();
    });
  });

  describe("dispatcher", () => {
    beforeEach(() => {
      spyOn(AuthProvidersStore, "fetch");
    });

    afterEach(() => {
      AuthProvidersStore.removeAllListeners();
    });

    it("updates reducer with correct number of items", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_PROVIDERS_SUCCESS,
        data: {
          oidc: {
            foo: "foo description",
            bar: "bar description"
          },
          saml: {}
        }
      });

      expect(AuthProvidersStore.getProviders().getItems().length).toEqual(2);
    });

    it("updates reducer correctly", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_PROVIDERS_SUCCESS,
        data: {
          oidc: {},
          saml: {
            foo: "foo description"
          }
        }
      });

      expect(AuthProvidersStore.getProviders().getItems().length).toEqual(1);
      expect(
        AuthProvidersStore.getProviders()
          .getItems()[0]
          .getDescription()
      ).toEqual("foo description");

      expect(
        AuthProvidersStore.getProviders()
          .getItems()[0]
          .getID()
      ).toEqual("foo");

      expect(
        AuthProvidersStore.getProviders()
          .getItems()[0]
          .getProviderType()
      ).toEqual("saml");
    });

    it("emits success event correctly", () => {
      const mockFn = jest.fn();

      AuthProvidersStore.addChangeListener(EventTypes.PROVIDERS_CHANGE, mockFn);

      SDK.dispatch({
        type: ActionTypes.REQUEST_PROVIDERS_SUCCESS,
        data: { oidc: {}, saml: {} }
      });

      expect(mockFn.mock.calls.length).toEqual(1);
    });

    it("emits error event with the providerID", () => {
      const error = { err: "error" };
      const mockFn = jest.fn();

      AuthProvidersStore.addChangeListener(EventTypes.PROVIDERS_ERRORS, mockFn);

      SDK.dispatch({
        type: ActionTypes.REQUEST_PROVIDERS_ERROR,
        data: error
      });

      expect(mockFn.mock.calls.length).toEqual(1);
      expect(mockFn.mock.calls[0][0]).toEqual(error);
    });

    it("fetches providers on AuthProviderStore create success", () => {
      SDK.dispatch({
        type: EventTypes.PROVIDER_CREATE_SUCCESS
      });

      expect(AuthProvidersStore.fetch).toHaveBeenCalled();
    });

    it("fetches providers on AuthProviderStore delete success", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_PROVIDERS_SUCCESS,
        data: {
          oidc: {
            foo: "foo description",
            bar: "bar description"
          },
          saml: {}
        }
      });

      SDK.dispatch({
        type: EventTypes.PROVIDER_DELETE_SUCCESS,
        providerID: "foo",
        providerType: "oidc"
      });

      expect(AuthProvidersStore.fetch).toHaveBeenCalled();
    });

    it("fetches providers on AuthProviderStore update success", () => {
      SDK.dispatch({
        type: EventTypes.PROVIDER_UPDATE_SUCCESS
      });

      expect(AuthProvidersStore.fetch).toHaveBeenCalled();
    });
  });
});
