import { EventEmitter } from "events";

import {
  REQUEST_PROVIDER_CALLBACK_URL_SUCCESS,
  REQUEST_PROVIDER_CALLBACK_URL_ERROR,
  REQUEST_PROVIDER_CREATE_SUCCESS,
  REQUEST_PROVIDER_CREATE_ERROR,
  REQUEST_PROVIDER_DELETE_SUCCESS,
  REQUEST_PROVIDER_DELETE_ERROR,
  REQUEST_PROVIDER_SUCCESS,
  REQUEST_PROVIDER_ERROR,
  REQUEST_PROVIDER_UPDATE_SUCCESS,
  REQUEST_PROVIDER_UPDATE_ERROR
} from "../constants/ActionTypes";

import {
  PROVIDER_CALLBACK_URL_SUCCESS,
  PROVIDER_CALLBACK_URL_ERROR,
  PROVIDER_CREATE_SUCCESS,
  PROVIDER_CREATE_ERROR,
  PROVIDER_DELETE_SUCCESS,
  PROVIDER_DELETE_ERROR,
  PROVIDER_SUCCESS,
  PROVIDER_ERROR,
  PROVIDER_UPDATE_SUCCESS,
  PROVIDER_UPDATE_ERROR
} from "../constants/EventTypes";

import AuthProviderActions from "../actions/AuthProviderActions";
import AuthProvider from "../structs/AuthProvider";

const SDK = require("../SDK").getSDK();

class AuthProviderStore extends EventEmitter {
  constructor(...args) {
    super(...args);

    SDK.addStoreConfig({
      store: this,
      storeID: "authProvider",
      events: {
        success: PROVIDER_SUCCESS,
        error: PROVIDER_ERROR,
        createSuccess: PROVIDER_CREATE_SUCCESS,
        createError: PROVIDER_CREATE_ERROR,
        deleteSuccess: PROVIDER_DELETE_SUCCESS,
        deleteError: PROVIDER_DELETE_ERROR,
        updateSuccess: PROVIDER_UPDATE_SUCCESS,
        updateError: PROVIDER_UPDATE_ERROR,
        callbackUrlSuccess: PROVIDER_CALLBACK_URL_SUCCESS,
        callbackUrlError: PROVIDER_CALLBACK_URL_ERROR
      },
      unmountWhen: () => false
    });

    SDK.onDispatch(action => {
      switch (action.type) {
        case REQUEST_PROVIDER_CREATE_SUCCESS:
          this.processCreateProvider(action.providerID, action.providerType);
          break;
        case REQUEST_PROVIDER_CREATE_ERROR:
          this.processCreateProviderError(
            action.providerID,
            action.providerType,
            action.data
          );
          break;
        case REQUEST_PROVIDER_DELETE_SUCCESS:
          this.processDeleteProvider(action.providerID, action.providerType);
          break;
        case REQUEST_PROVIDER_DELETE_ERROR:
          this.processDeleteProviderError(
            action.providerID,
            action.providerType,
            action.data
          );
          break;
        case REQUEST_PROVIDER_SUCCESS:
          this.processFetchProvider(
            action.providerID,
            action.providerType,
            action.data
          );
          break;
        case REQUEST_PROVIDER_ERROR:
          this.processFetchProviderError(
            action.providerID,
            action.providerType,
            action.data
          );
          break;
        case REQUEST_PROVIDER_UPDATE_SUCCESS:
          this.processUpdateProvider(
            action.providerID,
            action.providerType,
            action.data
          );
          break;
        case REQUEST_PROVIDER_UPDATE_ERROR:
          this.processUpdateProviderError(
            action.providerID,
            action.providerType,
            action.data
          );
          break;
        case REQUEST_PROVIDER_CALLBACK_URL_SUCCESS:
          this.processFetchCallbackURL(
            action.providerID,
            action.data["acs-callback-url"]
          );
          break;
        case REQUEST_PROVIDER_CALLBACK_URL_ERROR:
          this.emit(
            PROVIDER_CALLBACK_URL_ERROR,
            action.data,
            action.providerID
          );
          break;
      }
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  getProvider(providerType, providerID) {
    const provider = SDK.Store.getOwnState().providerDetail[providerType][
      providerID
    ];

    if (provider == null) {
      return null;
    }

    return new AuthProvider({
      ...provider,
      providerType
    });
  }

  create(...args) {
    return AuthProviderActions.create(...args);
  }

  delete(...args) {
    return AuthProviderActions.delete(...args);
  }

  fetch(...args) {
    return AuthProviderActions.fetch(...args);
  }

  update(...args) {
    return AuthProviderActions.update(...args);
  }

  fetchCallbackURL(...args) {
    return AuthProviderActions.fetchCallbackURL(...args);
  }

  processCreateProvider(providerID, providerType) {
    SDK.dispatch({
      type: PROVIDER_CREATE_SUCCESS,
      providerID,
      providerType
    });
    this.emit(PROVIDER_CREATE_SUCCESS, providerID, providerType);
  }

  processCreateProviderError(providerID, providerType, error) {
    this.emit(PROVIDER_CREATE_ERROR, error, providerID, providerType);
  }

  processDeleteProvider(providerID, providerType) {
    SDK.dispatch({
      type: PROVIDER_DELETE_SUCCESS,
      providerID,
      providerType
    });
    this.emit(PROVIDER_DELETE_SUCCESS, providerID, providerType);
  }

  processDeleteProviderError(providerID, providerType, error) {
    this.emit(PROVIDER_DELETE_ERROR, error, providerID, providerType);
  }

  processFetchProvider(providerID, providerType, provider) {
    SDK.dispatch({
      type: PROVIDER_SUCCESS,
      provider,
      providerID,
      providerType
    });
    this.emit(PROVIDER_SUCCESS, providerID, providerType);
  }

  processFetchProviderError(providerID, providerType, error) {
    this.emit(PROVIDER_ERROR, error, providerID, providerType);
  }

  processFetchCallbackURL(providerID, callbackURL) {
    SDK.dispatch({
      type: PROVIDER_CALLBACK_URL_SUCCESS,
      callbackURL,
      providerID
    });

    this.emit(PROVIDER_CALLBACK_URL_SUCCESS, providerID, callbackURL);
  }

  processUpdateProvider(providerID, providerType) {
    SDK.dispatch({
      type: PROVIDER_UPDATE_SUCCESS,
      providerID,
      providerType
    });
    this.emit(PROVIDER_UPDATE_SUCCESS, providerID, providerType);
  }

  processUpdateProviderError(providerID, providerType, error) {
    this.emit(PROVIDER_UPDATE_ERROR, error, providerID, providerType);
  }
}

export default new AuthProviderStore();
