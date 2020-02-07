import BaseStore from "#SRC/js/stores/BaseStore";
import List from "#SRC/js/structs/List";

import {
  REQUEST_PROVIDERS_SUCCESS,
  REQUEST_PROVIDERS_ERROR
} from "../constants/ActionTypes";

import {
  PROVIDERS_CHANGE,
  PROVIDERS_ERRORS,
  // Events triggered from AuthProviderStore
  PROVIDER_CREATE_SUCCESS,
  PROVIDER_DELETE_SUCCESS,
  PROVIDER_UPDATE_SUCCESS
} from "../constants/EventTypes";

import AuthProviderActions from "../actions/AuthProviderActions";
import AuthProvider from "../structs/AuthProvider";

const SDK = require("../SDK").getSDK();

class AuthProvidersStore extends BaseStore {
  constructor() {
    super();

    SDK.addStoreConfig({
      store: this,
      storeID: "authProviders",
      events: {
        change: PROVIDERS_CHANGE,
        error: PROVIDERS_ERRORS
      },
      unmountWhen: () => false
    });

    SDK.onDispatch(action => {
      switch (action.type) {
        case REQUEST_PROVIDERS_SUCCESS:
          this.processProvidersSuccess(action.data);
          break;
        case REQUEST_PROVIDERS_ERROR:
          this.processProvidersError(action.data);
          break;
        // Fetch when AuthProviderStore successfully changed
        case PROVIDER_CREATE_SUCCESS:
        case PROVIDER_DELETE_SUCCESS:
        case PROVIDER_UPDATE_SUCCESS:
          this.fetch();
          break;
      }
    });
  }

  fetch(...args) {
    return AuthProviderActions.fetchAll(...args);
  }

  getProviders() {
    let providers = this.getOIDCProviders() || [];
    providers = providers.concat(this.getSAMLProviders() || []);

    return new List({ items: providers });
  }

  getOIDCProviders() {
    const oidcProviders = SDK.Store.getOwnState().providers.oidc;

    return Object.keys(oidcProviders)
      .sort()
      .map(
        providerID =>
          new AuthProvider({
            description: oidcProviders[providerID],
            providerType: "oidc",
            providerID
          })
      );
  }

  getSAMLProviders() {
    const samlProviders = SDK.Store.getOwnState().providers.saml;

    return Object.keys(samlProviders)
      .sort()
      .map(
        providerID =>
          new AuthProvider({
            description: samlProviders[providerID],
            providerType: "saml",
            providerID
          })
      );
  }

  processProvidersSuccess(providers) {
    SDK.dispatch({
      type: PROVIDERS_CHANGE,
      providers
    });
    this.emit(PROVIDERS_CHANGE);
  }

  processProvidersError(error) {
    this.emit(PROVIDERS_ERRORS, error);
  }
}

export default new AuthProvidersStore();
