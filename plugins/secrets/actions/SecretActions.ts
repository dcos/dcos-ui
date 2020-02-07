import { RequestUtil } from "mesosphere-shared-reactjs";
import { request } from "@dcos/http-service";

import Config from "#SRC/js/config/Config";
import getFixtureResponses from "#SRC/js/utils/getFixtureResponses";

import PrivatePluginsConfig from "../../PrivatePluginsConfig";
import * as ActionTypes from "../constants/ActionTypes";

function isFile(value) {
  return value instanceof File;
}

const SDK = require("../SDK");

const SecretActions = {
  fetchStoreInitializationStatus(storeName) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/init/${storeName}`,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_INITIALIZATION_STATUS_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_INITIALIZATION_STATUS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  initializeStore(initializationRequest, storeName) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/init/${storeName}`,
      method: "PUT",
      data: initializationRequest,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_INITIALIZATION_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_INITIALIZATION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchSealStatus(storeName) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/seal-status/${storeName}`,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_SEAL_STATUS_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_SEAL_STATUS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  unsealStore(unsealRequest, storeName) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/unseal/${storeName}`,
      method: "PUT",
      data: unsealRequest,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_UNSEAL_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_UNSEAL_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchSecret(storeName, secretPath) {
    const url = `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/secret/${storeName}/${secretPath}`;

    request(url, {
      headers: { Accept: "*/*" },
      responseType: "text"
    }).subscribe({
      next: ({ response, responseHeaders }) => {
        let data;
        const contentType = responseHeaders["content-type"];

        if (contentType === "application/json") {
          data = JSON.parse(response);
        } else {
          // File based secret
          try {
            data = new File(response.split("\n"), "secret");
          } catch (e) {
            // Some browsers don't support the file api, we leave the data empty
            data = null;
          }
        }

        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_SECRET_SUCCESS,
          data,
          storeName,
          secretPath,
          contentType
        });
      },
      error: event => {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_SECRET_ERROR,
          data: event,
          storeName,
          secretPath
        });
      }
    });
  },

  createSecret(storeName, path, value) {
    const encodedPath = encodeURIComponent(path);

    const body = isFile(value)
      ? value
      : JSON.stringify({ path: encodedPath, value });

    request(
      `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/secret/${storeName}/${path}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": isFile(value)
            ? "application/octet-stream"
            : "application/json"
        },
        method: "PUT",
        body
      }
    ).subscribe({
      next: event => {
        const data = JSON.parse(event.response);

        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_CREATE_SECRET_SUCCESS,
          data
        });
      },
      error: event => {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_CREATE_SECRET_ERROR,
          data: event
        });
      }
    });
  },

  updateSecret(storeName, path, value) {
    const encodedPath = encodeURIComponent(path);

    const body = isFile(value)
      ? value
      : JSON.stringify({ path: encodedPath, value });

    request(
      `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/secret/${storeName}/${path}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": isFile(value)
            ? "application/octet-stream"
            : "application/json"
        },
        method: "PATCH",
        body
      }
    ).subscribe({
      next: event => {
        let data;
        try {
          data = JSON.parse(event.response);
        } catch (exception) {
          data = event.response;
        }

        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_UPDATE_SECRET_SUCCESS,
          data
        });
      },
      error: event => {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_UPDATE_SECRET_ERROR,
          data: event
        });
      }
    });
  },

  deleteSecret(storeName, secretPath) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/secret/${storeName}/${secretPath}`,
      method: "DELETE",
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_DELETE_SECRET_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_DELETE_SECRET_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchSecrets(storeName, secretPath = "") {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/secret/${storeName}/${secretPath}?list=true`,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_SECRETS_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_SECRETS_ERROR,
          data: xhr
        });
      }
    });
  },

  revokeSecret(storeName, secretPath) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/revoke/${storeName}/${secretPath}`,
      method: "PUT",
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_REVOKE_SECRET_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_REVOKE_SECRET_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  renewSecret(storeName, secretPath, durationObject) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/renew/${storeName}/${secretPath}`,
      method: "PUT",
      data: durationObject,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_RENEW_SECRET_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_RENEW_SECRET_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchStores() {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/store`,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_ALL_STORES_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_ALL_STORES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchStore(storeName) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/store/${storeName}`,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_BACKEND_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_BACKEND_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  createStore(storeName, storeObject) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/store/${storeName}`,
      method: "PUT",
      data: storeObject,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_BACKEND_CREATE_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_BACKEND_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  deleteStore(storeName, storeObject) {
    RequestUtil.json({
      url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/store/${storeName}`,
      method: "DELETE",
      data: storeObject,
      success(response) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_BACKEND_DELETE_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.getSDK().dispatch({
          type: ActionTypes.REQUEST_STORE_BACKEND_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const methodFixtureMapping = {
    fetchStoreInitializationStatus: import(
      /* storeInitializationStatus */ "../../../tests/_fixtures/secrets/store-initialization-status.json"
    ),
    fetchSealStatus: import(
      /* storeSealStatus */ "../../../tests/_fixtures/secrets/store-seal-status.json"
    ),
    unsealStore: import(
      /* storeSealStatus */ "../../../tests/_fixtures/secrets/store-seal-status.json"
    ),
    fetchSecret: import(
      /* secret */ "../../../tests/_fixtures/secrets/secret.json"
    ),
    createSecret: import(
      /* secret */ "../../../tests/_fixtures/secrets/secret.json"
    ),
    deleteSecret: import(
      /* secret */ "../../../tests/_fixtures/secrets/secret.json"
    ),
    fetchSecrets: import(
      /* secrets */ "../../../tests/_fixtures/secrets/secrets.json"
    ),
    fetchStores: import(
      /* stores */ "../../../tests/_fixtures/secrets/stores.json"
    ),
    fetchStore: import(
      /* backend */ "../../../tests/_fixtures/secrets/backend.json"
    )
  };

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  if (!window.actionTypes.SecretActions) {
    window.actionTypes.SecretActions = {};
  }

  Promise.all(
    Object.keys(methodFixtureMapping).map(
      method => methodFixtureMapping[method]
    )
  ).then(responses => {
    window.actionTypes.SecretActions = Object.assign(
      getFixtureResponses(methodFixtureMapping, responses),
      {
        initializeStore: {
          event: "success",
          success: { response: {} }
        },
        deleteSecret: {
          event: "success",
          success: { response: "Secret deleted." }
        },
        revokeSecret: {
          event: "success",
          success: { response: "Secret revoked." }
        },
        renewSecret: {
          event: "success",
          success: { response: "Secret renewed." }
        },
        createStore: {
          event: "success",
          success: { response: "Backend created." }
        },
        deleteStore: {
          event: "success",
          success: { response: "Backend deleted." }
        }
      }
    );

    Object.keys(window.actionTypes.SecretActions).forEach(method => {
      SecretActions[method] = RequestUtil.stubRequest(
        SecretActions,
        "SecretActions",
        method
      );
    });
  });
}

export default SecretActions;
