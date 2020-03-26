import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("auth-providers", { enabled: true });
require("../../SDK").setSDK(SDK);

const AuthProvider = require("../../structs/AuthProvider").default;
const AuthProviderStore = require("../AuthProviderStore").default;
import * as ActionTypes from "../../constants/ActionTypes";
const EventTypes = require("../../constants/EventTypes");
const AuthProviderReducer = require("../../Reducer");

PluginSDK.__addReducer("auth-providers", AuthProviderReducer);

describe("AuthProviderStore", () => {
  describe("#getProvider", () => {
    it("returns null when provider does not exist", () => {
      expect(AuthProviderStore.getProvider("oidc", "barry")).toEqual(null);
    });

    it("returns an instance of AuthProvider with correct properties", () => {
      const provider = { description: "baz" };
      const providerID = "foo";
      const providerType = "oidc";

      SDK.dispatch({
        type: EventTypes.PROVIDER_SUCCESS,
        provider,
        providerID,
        providerType,
      });

      expect(
        AuthProviderStore.getProvider(providerType, "foo") instanceof
          AuthProvider
      ).toBeTruthy();

      expect(
        AuthProviderStore.getProvider(providerType, providerID).getDescription()
      ).toEqual("baz");
    });
  });

  describe("dispatcher", () => {
    afterEach(() => {
      AuthProviderStore.removeAllListeners();
    });

    describe("create", () => {
      it("emits success event with the providerID", () => {
        const mockFn = jest.fn();
        const providerID = "foo";
        const providerType = "oidc";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_CREATE_SUCCESS,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_CREATE_SUCCESS,
          data: {},
          providerID,
          providerType,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(providerID);
      });

      it("emits error event with the providerID", () => {
        const error = { err: "error" };
        const mockFn = jest.fn();
        const providerID = "foo";
        const providerType = "oidc";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_CREATE_ERROR,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_CREATE_ERROR,
          data: error,
          providerID,
          providerType,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(error);
        expect(mockFn.mock.calls[0][1]).toEqual(providerID);
      });
    });

    describe("update", () => {
      it("updates reducer correctly", () => {
        const mockFn = jest.fn();
        const providerID = "foo";
        const providerType = "oidc";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_UPDATE_SUCCESS,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_UPDATE_SUCCESS,
          providerID,
          providerType,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
      });

      it("emits success event with the providerID", () => {
        const mockFn = jest.fn();
        const providerID = "foo";
        const providerType = "oidc";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_UPDATE_SUCCESS,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_UPDATE_SUCCESS,
          data: {},
          providerID,
          providerType,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(providerID);
      });

      it("emits error event with the providerID", () => {
        const error = { err: "error" };
        const mockFn = jest.fn();
        const providerID = "foo";
        const providerType = "oidc";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_UPDATE_ERROR,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_UPDATE_ERROR,
          data: error,
          providerID,
          providerType,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(error);
        expect(mockFn.mock.calls[0][1]).toEqual(providerID);
      });
    });

    describe("delete", () => {
      it("updates reducer correctly", () => {
        const providerID = "foo";
        const providerType = "oidc";

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_DELETE_SUCCESS,
          providerID,
          providerType,
        });

        expect(AuthProviderStore.getProvider(providerType, providerID)).toEqual(
          null
        );
      });

      it("emits success event with the providerID", () => {
        const mockFn = jest.fn();
        const providerID = "foo";
        const providerType = "oidc";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_DELETE_SUCCESS,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_DELETE_SUCCESS,
          providerID,
          providerType,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(providerID);
      });

      it("emits error event with the providerID", () => {
        const error = { err: "error" };
        const mockFn = jest.fn();
        const providerID = "foo";
        const providerType = "oidc";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_DELETE_ERROR,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_DELETE_ERROR,
          data: error,
          providerID,
          providerType,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(error);
        expect(mockFn.mock.calls[0][1]).toEqual(providerID);
      });
    });

    describe("callbackURL", () => {
      it("updates reducer correctly", () => {
        const providerID = "foo";
        const callbackURL = "https://foo.co";

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_CALLBACK_URL_SUCCESS,
          data: { "acs-callback-url": callbackURL },
          providerID,
        });

        expect(
          AuthProviderStore.getProvider("saml", providerID).getCallbackURL()
        ).toEqual(callbackURL);
      });

      it("emits success event with the providerID and callbackURL", () => {
        const mockFn = jest.fn();
        const providerID = "foo";
        const callbackURL = "https://foo.co";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_CALLBACK_URL_SUCCESS,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_CALLBACK_URL_SUCCESS,
          data: { "acs-callback-url": callbackURL },
          providerID,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(providerID);
        expect(mockFn.mock.calls[0][1]).toEqual(callbackURL);
      });

      it("emits error event with the providerID", () => {
        const error = { err: "error" };
        const mockFn = jest.fn();
        const providerID = "foo";

        AuthProviderStore.addChangeListener(
          EventTypes.PROVIDER_CALLBACK_URL_ERROR,
          mockFn
        );

        SDK.dispatch({
          type: ActionTypes.REQUEST_PROVIDER_CALLBACK_URL_ERROR,
          data: error,
          providerID,
        });

        expect(mockFn.mock.calls.length).toEqual(1);
        expect(mockFn.mock.calls[0][0]).toEqual(error);
        expect(mockFn.mock.calls[0][1]).toEqual(providerID);
      });
    });
  });
});
