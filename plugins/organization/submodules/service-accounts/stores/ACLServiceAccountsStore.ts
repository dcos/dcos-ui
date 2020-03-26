import BaseStore from "#SRC/js/stores/BaseStore";
import * as ActionTypes from "../constants/ActionTypes";

import * as EventTypes from "../constants/EventTypes";

import ACLServiceAccountActions from "../actions/ACLServiceAccountActions";
import ServiceAccount from "../structs/ServiceAccount";
import ServiceAccountList from "../structs/ServiceAccountList";
import { getSDK } from "../../../SDK";
import { ServiceAccountFormData } from "../../../utils/ServiceAccountFormUtil";

class ACLServiceAccountsStore extends BaseStore {
  constructor() {
    super();

    getSDK().addStoreConfig({
      store: this,
      storeID: "aclServiceAccounts",
      events: {
        // ServiceAccounts change
        change: EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE,
        error: EventTypes.ACL_SERVICE_ACCOUNTS_ERROR,
        // Individual ServiceAccount events
        fetchSuccess:
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_SERVICE_ACCOUNT_CHANGE,
        fetchError:
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_SERVICE_ACCOUNT_ERROR,
        createSuccess: EventTypes.ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
        createError: EventTypes.ACL_SERVICE_ACCOUNT_CREATE_ERROR,
        deleteSuccess: EventTypes.ACL_SERVICE_ACCOUNT_DELETE_SUCCESS,
        deleteError: EventTypes.ACL_SERVICE_ACCOUNT_DELETE_ERROR,
        fetchedDetailsSuccess:
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_SUCCESS,
        fetchedDetailsError:
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_ERROR,
        groupsSuccess: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_GROUPS_CHANGE,
        groupsError: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_GROUPS_ERROR,
        permissionsSuccess:
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_PERMISSIONS_CHANGE,
        permissionsError:
          EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_PERMISSIONS_ERROR,
        updateSuccess: EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
        updateError: EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
      },
      unmountWhen: () => false,
    });

    getSDK().onDispatch((action: any) => {
      switch (action.type) {
        // Get serviceAccount details
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_SUCCESS:
          this.processServiceAccount(action.data);
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_ERROR:
          this.processServiceAccountError(action.serviceAccountID);
          break;
        // Delete serviceAccount
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_DELETE_SUCCESS:
          this.fetchAll();
          this.emit(
            EventTypes.ACL_SERVICE_ACCOUNT_DELETE_SUCCESS,
            action.serviceAccountID
          );
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_DELETE_ERROR:
          this.emit(
            EventTypes.ACL_SERVICE_ACCOUNT_DELETE_ERROR,
            action.data,
            action.serviceAccountID,
            action.xhr
          );
          break;
        // Create serviceAccount
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_SUCCESS:
          this.fetchAll();
          this.emit(
            EventTypes.ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
            action.serviceAccountID
          );
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_CREATE_ERROR:
          this.emit(
            EventTypes.ACL_SERVICE_ACCOUNT_CREATE_ERROR,
            action.data,
            action.serviceAccountID,
            action.xhr
          );
          break;
        // Get groups for serviceAccount
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_SUCCESS:
          this.processServiceAccountGroups(
            action.data,
            action.serviceAccountID
          );
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_GROUPS_ERROR:
          this.processServiceAccountGroupsError(action.serviceAccountID);
          break;
        // Get ACLs for serviceAccount
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_SUCCESS:
          this.processServiceAccountPermissions(
            action.data,
            action.serviceAccountID
          );
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_PERMISSIONS_ERROR:
          this.processServiceAccountPermissionsError(action.serviceAccountID);
          break;
        // Update serviceAccount
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS:
          this.processServiceAccountUpdateSuccess(
            action.serviceAccountID,
            action.patch
          );
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNT_UPDATE_ERROR:
          this.emit(
            EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
            action.data,
            action.serviceAccountID,
            action.xhr
          );
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNTS_SUCCESS:
          this.processServiceAccounts(action.data);
          break;
        case ActionTypes.REQUEST_ACL_SERVICE_ACCOUNTS_ERROR:
          this.emit(
            EventTypes.ACL_SERVICE_ACCOUNTS_ERROR,
            action.data,
            action.serviceAccountID
          );
          break;
      }
    });
  }

  public addListener(event: string, callback: () => void) {
    return super.addListener(event, callback);
  }

  public removeListener(event: string, callback: () => void) {
    return super.removeListener(event, callback);
  }

  public emit(event: string | symbol, ...args: any[]) {
    return super.emit(event, ...args);
  }

  public add(formData: ServiceAccountFormData) {
    return ACLServiceAccountActions.add(formData);
  }

  public delete = ACLServiceAccountActions.delete;
  public fetch = ACLServiceAccountActions.fetch;
  public fetchAll = ACLServiceAccountActions.fetchAll;
  public update = ACLServiceAccountActions.update;

  public getServiceAccounts() {
    const items = getSDK().Store.getOwnState().serviceAccounts.serviceAccounts;

    return new ServiceAccountList({ items });
  }

  public getServiceAccountsDetail() {
    return getSDK().Store.getOwnState().serviceAccounts.serviceAccountsDetail;
  }

  public getServiceAccountsFetching() {
    return getSDK().Store.getOwnState().serviceAccounts.serviceAccountsFetching;
  }

  public getServiceAccountRaw(serviceAccountID: string) {
    return this.getServiceAccountsDetail()[serviceAccountID] || {};
  }

  public getServiceAccount(serviceAccountID: string) {
    const serviceAccount = this.getServiceAccountRaw(serviceAccountID);

    if (!Object.keys(serviceAccount).length) {
      return null;
    }

    return new ServiceAccount(serviceAccount);
  }

  public setServiceAccount(serviceAccountID: string, serviceAccount: any) {
    const serviceAccounts = this.getServiceAccountsDetail();

    serviceAccounts[serviceAccountID] = serviceAccount;

    getSDK().dispatch({
      type: EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT,
      serviceAccounts,
    });
  }

  /**
   * Fetch serviceAccount details and all associated data
   *
   * @param  {Number} serviceAccountID
   */
  public fetchServiceAccountWithDetails(serviceAccountID: string) {
    const serviceAccountsFetching = this.getServiceAccountsFetching();

    serviceAccountsFetching[serviceAccountID] = {
      serviceAccount: false,
      groups: false,
      permissions: false,
    };

    getSDK().dispatch({
      type: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCH_START,
      serviceAccountsFetching,
    });

    ACLServiceAccountActions.fetch(serviceAccountID);
    ACLServiceAccountActions.fetchGroups(serviceAccountID);
    ACLServiceAccountActions.fetchPermissions(serviceAccountID);
  }

  /**
   * Validates the details for a serviceAccount have been successfully fetched
   *
   * @param  {Number} serviceAccountID
   * @param  {String} type The type of detail that has been successfully
   * received
   */
  public validateServiceAccountWithDetailsFetch(
    serviceAccountID: string,
    type: string
  ) {
    const serviceAccountsFetching = this.getServiceAccountsFetching();
    if (serviceAccountsFetching[serviceAccountID] == null) {
      return;
    }
    serviceAccountsFetching[serviceAccountID][type] = true;

    const fetchedAll = !Object.keys(
      serviceAccountsFetching[serviceAccountID]
    ).some((key) => {
      return !serviceAccountsFetching[serviceAccountID][key];
    });

    if (fetchedAll) {
      delete serviceAccountsFetching[serviceAccountID];
      getSDK().dispatch({
        type: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_SUCCESS,
        serviceAccountsFetching,
      });
      this.emit(
        EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_SUCCESS,
        serviceAccountID
      );
    }
  }

  /**
   * Emits error if we're in the process of fetching details for a serviceAccount
   * and one of the requests fails.
   *
   * @param  {Number} serviceAccountID
   */
  public invalidateServiceAccountWithDetailsFetch(serviceAccountID: string) {
    const serviceAccountsFetching = this.getServiceAccountsFetching();

    if (serviceAccountsFetching[serviceAccountID] == null) {
      return;
    }
    delete serviceAccountsFetching[serviceAccountID];

    getSDK().dispatch({
      type: EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_ERROR,
      serviceAccountsFetching,
    });
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_ERROR,
      serviceAccountID
    );
  }

  /**
   * Process a serviceAccount response
   *
   * @param  {Object} serviceAccountData
   */
  public processServiceAccount(serviceAccountData: { uid: string }) {
    let serviceAccount = this.getServiceAccountRaw(serviceAccountData.uid);

    serviceAccount = { ...serviceAccount, ...serviceAccountData };

    this.setServiceAccount(serviceAccount.uid, serviceAccount);
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_SERVICE_ACCOUNT_CHANGE,
      serviceAccount.uid
    );

    this.validateServiceAccountWithDetailsFetch(
      serviceAccount.uid,
      "serviceAccount"
    );
  }

  public processServiceAccountError(serviceAccountID: string) {
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_SERVICE_ACCOUNT_ERROR,
      serviceAccountID
    );
    this.invalidateServiceAccountWithDetailsFetch(serviceAccountID);
  }

  /**
   * Process an array of serviceAccounts
   *
   * @param  {Array} serviceAccounts All existing serviceAccounts
   */
  public processServiceAccounts(serviceAccounts: Array<{ uid: string }>) {
    getSDK().dispatch({
      type: EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE,
      serviceAccounts,
    });
    this.emit(EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE);
  }

  /**
   * Process a serviceAccount groups response
   *
   * @param {Object} groups Groups associated with serviceAccount
   * @param  {Object} serviceAccountID
   */
  public processServiceAccountGroups(
    groups: object[],
    serviceAccountID: string
  ) {
    let serviceAccount = this.getServiceAccountRaw(serviceAccountID);

    serviceAccount = { ...serviceAccount, ...{ groups } };

    // Use serviceAccountID throughout as the
    // serviceAccount may not have been previously set
    this.setServiceAccount(serviceAccountID, serviceAccount);
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_GROUPS_CHANGE,
      serviceAccountID
    );

    this.validateServiceAccountWithDetailsFetch(serviceAccountID, "groups");
  }

  public processServiceAccountGroupsError(serviceAccountID: string) {
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_GROUPS_ERROR,
      serviceAccountID
    );
    this.invalidateServiceAccountWithDetailsFetch(serviceAccountID);
  }

  /**
   * Process a serviceAccount permissions response
   *
   * @param {Object} permissions Permissions associated with serviceAccount
   * @param  {Object} serviceAccountID
   */
  public processServiceAccountPermissions(
    permissions: object,
    serviceAccountID: string
  ) {
    let serviceAccount = this.getServiceAccountRaw(serviceAccountID);

    serviceAccount = { ...serviceAccount, ...{ permissions } };

    // Use serviceAccountID throughout as the
    // serviceAccount may not have been previously set
    this.setServiceAccount(serviceAccountID, serviceAccount);
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_PERMISSIONS_CHANGE,
      serviceAccountID
    );

    this.validateServiceAccountWithDetailsFetch(
      serviceAccountID,
      "permissions"
    );
  }

  public processServiceAccountPermissionsError(serviceAccountID: string) {
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_PERMISSIONS_ERROR,
      serviceAccountID
    );
    this.invalidateServiceAccountWithDetailsFetch(serviceAccountID);
  }

  public processServiceAccountUpdateSuccess(
    serviceAccountID: string,
    patch: object
  ) {
    const serviceAccount = this.getServiceAccountRaw(serviceAccountID);

    this.setServiceAccount(serviceAccountID, { ...serviceAccount, ...patch });
    this.fetchAll();
    this.emit(
      EventTypes.ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
      serviceAccountID,
      patch
    );
  }
}

let store: ACLServiceAccountsStore;
export default () => store || (store = new ACLServiceAccountsStore());
