import { EventEmitter } from "events";
import NotificationStore from "#SRC/js/stores/NotificationStore";

import * as ActionTypes from "../constants/ActionTypes";
import * as EventTypes from "../constants/EventTypes";
import SecretActions from "../actions/SecretActions";
import Secret from "../structs/Secret";
import PrivatePluginsConfig from "../../PrivatePluginsConfig";

import { getSDK } from "../SDK";

const NOTIFICATION_LOCATIONS = [
  "system",
  "system-security",
  "system-security-stores",
];
const NOTIFICATION_ID = "sealedStores";

// stores: Array<{
//   driver?: string;
//   description?: string;
//   sealed?: boolean;
// }>;

class SecretStore extends EventEmitter {
  constructor() {
    super();

    getSDK().addStoreConfig({
      store: this,
      storeID: "secrets",
      events: {
        storesSuccess: EventTypes.SECRET_ALL_STORES_SUCCESS,
        storesError: EventTypes.SECRET_ALL_STORES_ERROR,
        createSecretSuccess: EventTypes.SECRET_STORE_CREATE_SECRET_SUCCESS,
        createSecretError: EventTypes.SECRET_STORE_CREATE_SECRET_ERROR,
        deleteSecretSuccess: EventTypes.SECRET_STORE_DELETE_SECRET_SUCCESS,
        deleteSecretError: EventTypes.SECRET_STORE_DELETE_SECRET_ERROR,
        storeSealStatusSuccess: EventTypes.SECRET_STORE_SEAL_STATUS_SUCCESS,
        storeSealStatusError: EventTypes.SECRET_STORE_SEAL_STATUS_ERROR,
        secretDetailSuccess: EventTypes.SECRET_STORE_SECRET_SUCCESS,
        secretDetailError: EventTypes.SECRET_STORE_SECRET_ERROR,
        secretsSuccess: EventTypes.SECRET_STORE_SECRETS_SUCCESS,
        secretsError: EventTypes.SECRET_STORE_SECRETS_ERROR,
        renewSecretSuccess: EventTypes.SECRET_STORE_RENEW_SECRET_SUCCESS,
        renewSecretError: EventTypes.SECRET_STORE_RENEW_SECRET_ERROR,
        revokeSecretSuccess: EventTypes.SECRET_STORE_REVOKE_SECRET_SUCCESS,
        revokeSecretError: EventTypes.SECRET_STORE_REVOKE_SECRET_ERROR,
        updateSecretSuccess: EventTypes.SECRET_STORE_UPDATE_SECRET_SUCCESS,
        updateSecretError: EventTypes.SECRET_STORE_UPDATE_SECRET_ERROR,
      },
      unmountWhen: () => false,
    });

    getSDK().onDispatch((action: any) => {
      switch (action.type) {
        case ActionTypes.REQUEST_ALL_STORES_SUCCESS:
          this.processStores(action.data);
          break;
        case ActionTypes.REQUEST_ALL_STORES_ERROR:
          this.emit(EventTypes.SECRET_ALL_STORES_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_CREATE_SECRET_SUCCESS:
          this.emit(EventTypes.SECRET_STORE_CREATE_SECRET_SUCCESS);
          break;
        case ActionTypes.REQUEST_STORE_CREATE_SECRET_ERROR:
          this.emit(EventTypes.SECRET_STORE_CREATE_SECRET_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_DELETE_SECRET_SUCCESS:
          this.emit(EventTypes.SECRET_STORE_DELETE_SECRET_SUCCESS);
          break;
        case ActionTypes.REQUEST_STORE_DELETE_SECRET_ERROR:
          this.emit(EventTypes.SECRET_STORE_DELETE_SECRET_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_SEAL_STATUS_SUCCESS:
          this.processSealStatus(action.data);
          break;
        case ActionTypes.REQUEST_STORE_SEAL_STATUS_ERROR:
          this.emit(EventTypes.SECRET_STORE_SEAL_STATUS_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_SECRET_SUCCESS:
          this.processSecretDetail(
            action.data,
            action.storeName,
            action.secretPath,
            action.contentType
          );
          break;
        case ActionTypes.REQUEST_STORE_SECRET_ERROR:
          this.emit(EventTypes.SECRET_STORE_SECRET_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_SECRETS_SUCCESS:
          this.processSecrets(action.data);
          break;
        case ActionTypes.REQUEST_STORE_SECRETS_ERROR:
          this.emit(EventTypes.SECRET_STORE_SECRETS_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_RENEW_SECRET_SUCCESS:
          this.emit(EventTypes.SECRET_STORE_RENEW_SECRET_SUCCESS);
          break;
        case ActionTypes.REQUEST_STORE_RENEW_SECRET_ERROR:
          this.emit(EventTypes.SECRET_STORE_RENEW_SECRET_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_REVOKE_SECRET_SUCCESS:
          this.emit(EventTypes.SECRET_STORE_REVOKE_SECRET_SUCCESS);
          break;
        case ActionTypes.REQUEST_STORE_REVOKE_SECRET_ERROR:
          this.emit(EventTypes.SECRET_STORE_REVOKE_SECRET_ERROR, action.data);
          break;
        case ActionTypes.REQUEST_STORE_UPDATE_SECRET_SUCCESS:
          this.emit(EventTypes.SECRET_STORE_UPDATE_SECRET_SUCCESS);
          break;
        case ActionTypes.REQUEST_STORE_UPDATE_SECRET_ERROR:
          this.emit(EventTypes.SECRET_STORE_UPDATE_SECRET_ERROR, action.data);
          break;
      }
    });
  }

  public addChangeListener(eventName: string, callback: any) {
    this.on(eventName, callback);
  }

  public removeChangeListener(eventName: string, callback: any) {
    this.removeListener(eventName, callback);
  }

  public createSecret(
    storeName: string,
    secretPath: string,
    secretObject: unknown
  ) {
    SecretActions.createSecret(storeName, secretPath, secretObject);
  }

  public deleteSecret(storeName: string, secretPath: string) {
    SecretActions.deleteSecret(storeName, secretPath);
  }

  public fetchSealStatus(storeName: string) {
    SecretActions.fetchSealStatus(storeName);
  }

  public fetchStores() {
    SecretActions.fetchStores();
  }

  public renewSecret(
    storeName: string,
    secretPath: string,
    durationObject: unknown
  ) {
    SecretActions.renewSecret(storeName, secretPath, durationObject);
  }

  public revokeSecret(storeName: string, secretPath: string) {
    SecretActions.revokeSecret(storeName, secretPath);
  }

  public updateSecret(
    storeName: string,
    secretPath: string,
    secretObject: unknown
  ) {
    SecretActions.updateSecret(storeName, secretPath, secretObject);
  }

  public fetchSecret(storeName: string, secretPath: string) {
    SecretActions.fetchSecret(storeName, secretPath);
  }

  public fetchSecrets() {
    SecretActions.fetchSecrets(PrivatePluginsConfig.secretsDefaultStore);
  }

  public get(prop: string) {
    return getSDK().Store.getOwnState()[prop];
  }

  public getStores() {
    return this.get("stores");
  }

  public getSecretDetail() {
    const secretDetail = this.get("secretDetail");
    if (Object.keys(secretDetail).length === 0) {
      return null;
    }

    return new Secret(secretDetail);
  }

  public getSecrets(): Secret[] {
    return this.get("secrets").map((path: string) => new Secret({ path }));
  }

  public processStores(stores: any) {
    getSDK().dispatch({ type: EventTypes.SECRET_ALL_STORES_SUCCESS, stores });
    const notificationCount = NotificationStore.getNotificationCount(
      "system-security-stores"
    );

    if (stores.some((s) => s.sealed)) {
      NotificationStore.addNotification(
        NOTIFICATION_LOCATIONS,
        NOTIFICATION_ID,
        1
      );
    } else if (notificationCount > 0) {
      NotificationStore.removeNotification(
        NOTIFICATION_LOCATIONS,
        NOTIFICATION_ID
      );
    }
    this.emit(EventTypes.SECRET_ALL_STORES_SUCCESS);
  }

  public processSecrets(secrets: any) {
    getSDK().dispatch({
      type: EventTypes.SECRET_STORE_SECRETS_SUCCESS,
      secrets: secrets.array,
    });

    this.emit(EventTypes.SECRET_STORE_SECRETS_SUCCESS);
  }

  public processSealStatus(status: any) {
    getSDK().dispatch({
      type: EventTypes.SECRET_STORE_SEAL_STATUS_SUCCESS,
      isSealed: status.sealed,
    });

    this.emit(EventTypes.SECRET_STORE_SEAL_STATUS_SUCCESS);
  }

  public processSecretDetail(
    secretDetail: any,
    storeName: string,
    secretPath: string,
    contentType: string
  ) {
    getSDK().dispatch({
      type: EventTypes.SECRET_STORE_SECRET_SUCCESS,
      secretDetail,
      storeName,
      secretPath,
      contentType,
    });

    this.emit(EventTypes.SECRET_STORE_SECRET_SUCCESS);
  }
}

let store: SecretStore;
export default () => store || (store = new SecretStore());
