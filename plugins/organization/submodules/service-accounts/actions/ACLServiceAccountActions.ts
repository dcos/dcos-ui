import { RequestUtil } from "mesosphere-shared-reactjs";

import Config from "#SRC/js/config/Config";
import Util from "#SRC/js/utils/Util";
import PrivatePluginsConfig from "../../../../PrivatePluginsConfig";
import SDK from "PluginSDK";

import * as ActionTypes from "../constants/ActionTypes";

const {
  REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
  REQUEST_ACL_SERVICE_ACCOUNT_CREATE_ERROR,
  REQUEST_ACL_SERVICE_ACCOUNT_DELETE_SUCCESS,
  REQUEST_ACL_SERVICE_ACCOUNT_DELETE_ERROR,
  REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_SUCCESS,
  REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_ERROR,
  REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_SUCCESS,
  REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_ERROR,
  REQUEST_ACL_SERVICE_ACCOUNT_SUCCESS,
  REQUEST_ACL_SERVICE_ACCOUNT_ERROR,
  REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
  REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
  REQUEST_ACL_SERVICE_ACCOUNTS_SUCCESS,
  REQUEST_ACL_SERVICE_ACCOUNTS_ERROR
} = ActionTypes;

// Helper function to create a secret alongside the service account when
// auto-generating key pairs.
const addAccountSecretOrDeleteAccount = (serviceAccountID, data) => {
  const { secret_path, private_key } = data;
  const encodedSecretPath = encodeURIComponent(secret_path);

  RequestUtil.json({
    url: `${Config.rootUrl}${PrivatePluginsConfig.secretsAPIPrefix}/secret/${PrivatePluginsConfig.secretsDefaultStore}/${encodedSecretPath}`,
    method: "PUT",
    data: {
      path: secret_path,
      store_id: PrivatePluginsConfig.secretsDefaultStore,
      value: JSON.stringify({
        login_endpoint: "https://leader.mesos/acs/api/v1/auth/login",
        schema: "RS256",
        private_key,
        uid: serviceAccountID
      })
    },
    success() {
      SDK.dispatch({
        type: REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
        serviceAccountID
      });
    },
    error(xhr) {
      ACLServiceAccountActions.delete(serviceAccountID);

      let errorMessage;

      if (xhr.status === 409) {
        // Secrets endpoint doesn't provide error code
        errorMessage = `Secret with id '${secret_path}' already exists.`;
      } else if (xhr.status === 404) {
        errorMessage = `Invalid secret ID: ${secret_path}`;
      } else {
        errorMessage = RequestUtil.getErrorFromXHR(xhr);
      }

      SDK.dispatch({
        type: REQUEST_ACL_SERVICE_ACCOUNT_CREATE_ERROR,
        data: errorMessage,
        serviceAccountID,
        xhr
      });
    }
  });
};

const ACLServiceAccountActions = {
  add(data) {
    let serviceAccountID = data.uid;
    const keyMethod = data.key_method;
    const secretData = Util.pluck(data, ["secret_path", "private_key"]);
    const accountData = Util.omit(data, [
      "uid",
      "key_method",
      "secret_path",
      "private_key"
    ]);

    if (!serviceAccountID && data.description) {
      serviceAccountID = data.description.replace(/\s+/g, "").toLowerCase();
    }
    const encodedID = encodeURIComponent(serviceAccountID);

    RequestUtil.json({
      timeout: null,
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${encodedID}`,
      method: "PUT",
      data: accountData,
      success() {
        if (keyMethod === "auto-generate" && secretData) {
          addAccountSecretOrDeleteAccount(serviceAccountID, secretData);
          // addAccountSecretOrDeleteAccount will dispatch REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
          // REQUEST_ACL_SERVICE_ACCOUNT_CREATE_ERROR, or REQUEST_ACL_SERVICE_ACCOUNT_DELETE_ERROR

          return;
        }

        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
          serviceAccountID
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceAccountID,
          xhr
        });
      }
    });
  },

  delete(serviceAccountID) {
    const encodedID = encodeURIComponent(serviceAccountID);
    RequestUtil.json({
      timeout: null,
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${encodedID}`,
      method: "DELETE",
      success() {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_DELETE_SUCCESS,
          serviceAccountID
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceAccountID
        });
      }
    });
  },

  fetch(serviceAccountID) {
    const encodedID = encodeURIComponent(serviceAccountID);
    RequestUtil.json({
      timeout: null,
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${encodedID}`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_SUCCESS,
          data: response,
          serviceAccountID
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceAccountID
        });
      }
    });
  },

  fetchAll() {
    RequestUtil.json({
      timeout: null,
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users?type=service`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNTS_SUCCESS,
          data: response.array
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNTS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchGroups(serviceAccountID) {
    const encodedID = encodeURIComponent(serviceAccountID);
    RequestUtil.json({
      timeout: null,
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${encodedID}/groups`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_SUCCESS,
          data: response.array,
          serviceAccountID
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceAccountID
        });
      }
    });
  },

  fetchPermissions(serviceAccountID) {
    const encodedID = encodeURIComponent(serviceAccountID);
    RequestUtil.json({
      timeout: null,
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${encodedID}/permissions`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_SUCCESS,
          data: response,
          serviceAccountID
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceAccountID
        });
      }
    });
  },

  update(serviceAccountID, patchData) {
    const encodedID = encodeURIComponent(serviceAccountID);
    RequestUtil.json({
      timeout: null,
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/users/${encodedID}`,
      method: "PATCH",
      data: patchData,
      success(response) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
          data: response,
          serviceAccountID
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceAccountID
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const serviceAccountFixture = import(
    /* serviceAccountFixture */ "../../../../../tests/_fixtures/acl/service-account-unicode.json"
  );
  const serviceAccountsFixture = import(
    /* serviceAccountsFixture */ "../../../../../tests/_fixtures/acl/service-accounts-unicode.json"
  );
  const serviceAccountDetailsFixture = import(
    /* serviceAccountDetailsFixture */ "../../../../../tests/_fixtures/acl/service-account-with-details.json"
  );

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  Promise.all([
    serviceAccountFixture,
    serviceAccountsFixture,
    serviceAccountDetailsFixture
  ]).then(responses => {
    window.actionTypes.ACLServiceAccountActions = {
      fetch: { event: "success", success: { response: responses[0] } },
      fetchAll: {
        event: "success",
        success: { response: responses[1] }
      },
      fetchGroups: {
        event: "success",
        success: {
          response: responses[2].groups
        }
      },
      fetchPermissions: {
        event: "success",
        success: {
          response: responses[2].permissions
        }
      },
      update: { event: "success" }
    };

    Object.keys(window.actionTypes.ACLServiceAccountActions).forEach(method => {
      ACLServiceAccountActions[method] = RequestUtil.stubRequest(
        ACLServiceAccountActions,
        "ACLServiceAccountActions",
        method
      );
    });
  });
}

export default ACLServiceAccountActions;
