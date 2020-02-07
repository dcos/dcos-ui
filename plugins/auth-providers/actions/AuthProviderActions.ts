import { RequestUtil } from "mesosphere-shared-reactjs";
import Config from "#SRC/js/config/Config";
import getFixtureResponses from "#SRC/js/utils/getFixtureResponses";

import {
  REQUEST_PROVIDER_CALLBACK_URL_SUCCESS,
  REQUEST_PROVIDER_CALLBACK_URL_ERROR,
  REQUEST_PROVIDER_CREATE_SUCCESS,
  REQUEST_PROVIDER_CREATE_ERROR,
  REQUEST_PROVIDER_DELETE_SUCCESS,
  REQUEST_PROVIDER_DELETE_ERROR,
  REQUEST_PROVIDER_UPDATE_SUCCESS,
  REQUEST_PROVIDER_UPDATE_ERROR,
  REQUEST_PROVIDER_SUCCESS,
  REQUEST_PROVIDER_ERROR,
  REQUEST_PROVIDERS_SUCCESS,
  REQUEST_PROVIDERS_ERROR
} from "../constants/ActionTypes";

const SDK = require("../SDK").getSDK();

const getProviderURL = (providerType, providerID) =>
  `${Config.rootUrl}${Config.acsAPIPrefix}/auth/${providerType}/providers/${providerID}`;

const AuthProviderActions = {
  fetchAll() {
    // Fetch providers from oidc and saml endpoints
    let data = {};

    function handleSuccess(providerResponse) {
      Object.assign(data, providerResponse);

      if (Config.useFixtures) {
        data = providerResponse.saml;
      }

      if (data.oidc != null && data.saml != null) {
        SDK.dispatch({
          type: REQUEST_PROVIDERS_SUCCESS,
          data
        });
      }
    }

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/auth/oidc/providers`,
      success(response) {
        handleSuccess({ oidc: response });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_PROVIDERS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/auth/saml/providers`,
      success(response) {
        handleSuccess({ saml: response });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_PROVIDERS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetch(providerType, providerID) {
    RequestUtil.json({
      url: getProviderURL(providerType, providerID),
      success(response) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_SUCCESS,
          data: response,
          providerID,
          providerType
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          providerID,
          providerType
        });
      }
    });
  },

  create(providerType, providerID, data) {
    RequestUtil.json({
      url: getProviderURL(providerType, providerID),
      method: "PUT",
      data,
      success(response) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_CREATE_SUCCESS,
          data: response,
          providerID,
          providerType
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_CREATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          providerID,
          providerType
        });
      }
    });
  },

  update(providerType, providerID, data) {
    RequestUtil.json({
      url: getProviderURL(providerType, providerID),
      method: "PATCH",
      data,
      success() {
        SDK.dispatch({
          type: REQUEST_PROVIDER_UPDATE_SUCCESS,
          providerID,
          providerType
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_UPDATE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          providerID,
          providerType
        });
      }
    });
  },

  delete(providerType, providerID) {
    RequestUtil.json({
      url: getProviderURL(providerType, providerID),
      method: "DELETE",
      success(response) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_DELETE_SUCCESS,
          data: response,
          providerID,
          providerType
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          providerID,
          providerType
        });
      }
    });
  },

  fetchCallbackURL(providerID) {
    RequestUtil.json({
      url: `${getProviderURL("saml", providerID)}/acs-callback-url`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_CALLBACK_URL_SUCCESS,
          data: response,
          providerID
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_PROVIDER_CALLBACK_URL_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          providerID
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const methodFixtureMapping = {
    fetchAll: import(
      /* providersFixture */ "../../../tests/_fixtures/OpenIDAuthProviders/providers.json"
    ),
    fetch: import(
      /* providerFixture */ "../../../tests/_fixtures/OpenIDAuthProviders/provider.json"
    )
  };

  if (!window.actionTypes) {
    window.actionTypes = {};
  }
  Promise.all(
    Object.keys(methodFixtureMapping).map(
      method => methodFixtureMapping[method]
    )
  ).then(responses => {
    window.actionTypes.AuthProviderActions = getFixtureResponses(
      methodFixtureMapping,
      responses
    );

    Object.keys(window.actionTypes.AuthProviderActions).forEach(method => {
      AuthProviderActions[method] = RequestUtil.stubRequest(
        AuthProviderActions,
        "AuthProviderActions",
        method
      );
    });
  });
}

export default AuthProviderActions;
