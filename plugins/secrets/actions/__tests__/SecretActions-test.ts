import SecretActions from "../SecretActions";
import PluginSDK from "PluginSDK";

jest.mock("@dcos/http-service");

const { of, throwError } = require("rxjs");
import { RequestUtil } from "mesosphere-shared-reactjs";
const httpService = require("@dcos/http-service");

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration,
  thisRequestUtilJSON,
  thisRootUrl,
  thisUseFixtures,
  unsubscribe;

describe("SecretActions", () => {
  beforeEach(() => {
    thisConfiguration = null;
    thisRequestUtilJSON = RequestUtil.json;
    thisRootUrl = Config.rootUrl;
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = false;
    Config.rootUrl = "";
    RequestUtil.json = (configuration) => {
      thisConfiguration = configuration;
    };
  });

  afterEach(() => {
    Config.rootUrl = thisRootUrl;
    Config.useFixtures = thisUseFixtures;
    RequestUtil.json = thisRequestUtilJSON;
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    jest.clearAllMocks();
  });

  describe("#fetchSealStatus", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.fetchSealStatus("default");
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_SEAL_STATUS_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.fetchSealStatus("default");
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_SEAL_STATUS_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.fetchSealStatus("default");
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#fetchSecret", () => {
    it("dispatches the correct action when successful", (done) => {
      httpService.request.mockReturnValueOnce(
        of({
          response: ['{ "bar": "baz" }'],
          responseHeaders: { "content-type": "application/json" },
        })
      );

      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          contentType: "application/json",
          type: ActionTypes.REQUEST_STORE_SECRET_SUCCESS,
          data: { bar: "baz" },
          storeName: "StoreName",
          secretPath: "SecretPath",
        });
        done();
      });

      SecretActions.fetchSecret("StoreName", "SecretPath");
    });

    it("dispatches the correct action when unsuccessful", (done) => {
      httpService.request.mockReturnValueOnce(throwError("Error"));

      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_SECRET_ERROR,
          data: "Error",
          storeName: "StoreName",
          secretPath: "SecretPath",
        });
        done();
      });

      SecretActions.fetchSecret("StoreName", "SecretPath");
    });
  });

  describe("#createSecret", () => {
    it("dispatches the correct action when successful", () => {
      httpService.request.mockReturnValueOnce(of({ response: { bar: "baz" } }));
      SecretActions.createSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_CREATE_SECRET_SUCCESS,
          data: { bar: "baz" },
        });
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      httpService.request.mockReturnValueOnce(throwError("Error"));

      SecretActions.createSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_CREATE_SECRET_ERROR,
          data: { responseJSON: { description: { bar: "baz" } } },
        });
      });
    });

    it("uses PUT for the request method", () => {
      httpService.request.mockReturnValueOnce(of({ response: { bar: "baz" } }));
      SecretActions.createSecret();
      expect(httpService.request.mock.calls[0][1].method).toBe("PUT");
    });
  });

  describe("#updateSecret", () => {
    it("dispatches the correct action when successful", () => {
      httpService.request.mockReturnValueOnce(of({ response: { bar: "baz" } }));
      SecretActions.updateSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_UPDATE_SECRET_SUCCESS,
          data: { bar: "baz" },
        });
      });
    });

    it("dispatches the correct action when unsuccessful", () => {
      httpService.request.mockReturnValueOnce(throwError("Error"));
      SecretActions.updateSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_UPDATE_SECRET_ERROR,
          data: { responseJSON: { description: { bar: "baz" } } },
        });
      });
    });

    it("uses PATCH for the request method", () => {
      httpService.request.mockReturnValueOnce(of({ response: { bar: "baz" } }));
      SecretActions.updateSecret();
      expect(httpService.request.mock.calls[0][1].method).toBe("PATCH");
    });
  });

  describe("#deleteSecret", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.deleteSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_DELETE_SECRET_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.deleteSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_DELETE_SECRET_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.deleteSecret();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses DELETE for the request method", () => {
      SecretActions.deleteSecret();
      expect(thisConfiguration.method).toEqual("DELETE");
    });
  });

  describe("#fetchSecrets", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.fetchSecrets();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_SECRETS_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.fetchSecrets();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_SECRETS_ERROR,
          data: { responseJSON: { description: { bar: "baz" } } },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.fetchSecrets();
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#revokeSecret", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.revokeSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_REVOKE_SECRET_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.revokeSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_REVOKE_SECRET_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.revokeSecret();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses PUT for the request method", () => {
      SecretActions.revokeSecret();
      expect(thisConfiguration.method).toEqual("PUT");
    });
  });

  describe("#renewSecret", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.renewSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_RENEW_SECRET_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.renewSecret();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_RENEW_SECRET_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.renewSecret();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses PUT for the request method", () => {
      SecretActions.renewSecret();
      expect(thisConfiguration.method).toEqual("PUT");
    });
  });

  describe("#fetchStores", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.fetchStores();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ALL_STORES_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.fetchStores();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_ALL_STORES_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.fetchStores();
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#fetchStore", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.fetchStore();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_BACKEND_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.fetchStore();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_BACKEND_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.fetchStore();
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#createStore", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.createStore();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_BACKEND_CREATE_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.createStore();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_BACKEND_CREATE_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.createStore();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses PUT for the request method", () => {
      SecretActions.createStore();
      expect(thisConfiguration.method).toEqual("PUT");
    });
  });

  describe("#deleteStore", () => {
    it("dispatches the correct action when successful", () => {
      SecretActions.deleteStore();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_BACKEND_DELETE_SUCCESS,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      SecretActions.deleteStore();
      unsubscribe = SDK.onDispatch((action) => {
        expect(action).toEqual({
          type: ActionTypes.REQUEST_STORE_BACKEND_DELETE_ERROR,
          data: { bar: "baz" },
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } },
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      SecretActions.deleteStore();
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("uses DELETE for the request method", () => {
      SecretActions.deleteStore();
      expect(thisConfiguration.method).toEqual("DELETE");
    });
  });
});
