import BaseStore from "#SRC/js/stores/BaseStore";
import {
  REQUEST_ACL_USER_SUCCESS,
  REQUEST_ACL_USER_ERROR,
  REQUEST_ACL_USER_GROUPS_SUCCESS,
  REQUEST_ACL_USER_GROUPS_ERROR,
  REQUEST_ACL_USER_PERMISSIONS_SUCCESS,
  REQUEST_ACL_USER_PERMISSIONS_ERROR,
  REQUEST_ACL_USER_CREATE_SUCCESS,
  REQUEST_ACL_USER_CREATE_ERROR,
  REQUEST_ACL_LDAP_USER_CREATE_SUCCESS,
  REQUEST_ACL_LDAP_USER_CREATE_ERROR,
  REQUEST_ACL_USER_UPDATE_SUCCESS,
  REQUEST_ACL_USER_UPDATE_ERROR,
  REQUEST_ACL_USER_DELETE_SUCCESS,
  REQUEST_ACL_USER_DELETE_ERROR,
} from "../constants/ActionTypes";

import {
  ACL_USER_DETAILS_FETCH_START,
  ACL_USER_DETAILS_FETCHED_SUCCESS,
  ACL_USER_DETAILS_FETCHED_ERROR,
  ACL_USER_DETAILS_USER_CHANGE,
  ACL_USER_DETAILS_USER_ERROR,
  ACL_USER_DETAILS_GROUPS_CHANGE,
  ACL_USER_DETAILS_GROUPS_ERROR,
  ACL_USER_DETAILS_PERMISSIONS_CHANGE,
  ACL_USER_DETAILS_PERMISSIONS_ERROR,
  ACL_USER_CREATE_SUCCESS,
  ACL_USER_CREATE_ERROR,
  ACL_LDAP_USER_CREATE_SUCCESS,
  ACL_LDAP_USER_CREATE_ERROR,
  ACL_USER_SET_USER,
  ACL_USER_UPDATE_SUCCESS,
  ACL_USER_UPDATE_ERROR,
  ACL_USER_DELETE_SUCCESS,
  ACL_USER_DELETE_ERROR,
} from "../constants/EventTypes";

import ACLUsersActions from "../actions/ACLUsersActions";
import User from "../structs/User";

const SDK = require("../../../SDK");
/**
 * This store will keep track of users and their details
 */
class ACLUserStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "aclUser",
      events: {
        fetchSuccess: ACL_USER_DETAILS_USER_CHANGE,
        fetchError: ACL_USER_DETAILS_USER_ERROR,
        permissionsSuccess: ACL_USER_DETAILS_PERMISSIONS_CHANGE,
        permissionsError: ACL_USER_DETAILS_PERMISSIONS_ERROR,
        groupsSuccess: ACL_USER_DETAILS_GROUPS_CHANGE,
        groupsError: ACL_USER_DETAILS_GROUPS_ERROR,
        fetchedDetailsSuccess: ACL_USER_DETAILS_FETCHED_SUCCESS,
        fetchedDetailsError: ACL_USER_DETAILS_FETCHED_ERROR,
        createLDAPSuccess: ACL_LDAP_USER_CREATE_SUCCESS,
        createLDAPError: ACL_LDAP_USER_CREATE_ERROR,
        updateSuccess: ACL_USER_UPDATE_SUCCESS,
        updateError: ACL_USER_UPDATE_ERROR,
      },
      unmountWhen: () => false,
    });

    SDK.getSDK().onDispatch((action) => {
      switch (action.type) {
        // Get user details
        case REQUEST_ACL_USER_SUCCESS:
          this.processUser(action.data);
          break;
        case REQUEST_ACL_USER_ERROR:
          this.processUserError(action.userID);
          break;
        // Get groups for user
        case REQUEST_ACL_USER_GROUPS_SUCCESS:
          this.processUserGroups(action.data, action.userID);
          break;
        case REQUEST_ACL_USER_GROUPS_ERROR:
          this.processUserGroupsError(action.userID);
          break;
        // Get ACLs for user
        case REQUEST_ACL_USER_PERMISSIONS_SUCCESS:
          this.processUserPermissions(action.data, action.userID);
          break;
        case REQUEST_ACL_USER_PERMISSIONS_ERROR:
          this.processUserPermissionsError(action.userID);
          break;
        // Create user
        case REQUEST_ACL_USER_CREATE_SUCCESS:
          this.emit(ACL_USER_CREATE_SUCCESS, action.userID);
          break;
        case REQUEST_ACL_USER_CREATE_ERROR:
          this.emit(ACL_USER_CREATE_ERROR, action.data, action.userID);
          break;
        // Create LDAP user
        case REQUEST_ACL_LDAP_USER_CREATE_SUCCESS:
          this.emit(ACL_LDAP_USER_CREATE_SUCCESS, action.userID);
          break;
        case REQUEST_ACL_LDAP_USER_CREATE_ERROR:
          this.emit(ACL_LDAP_USER_CREATE_ERROR, action.data, action.userID);
          break;
        // Update user
        case REQUEST_ACL_USER_UPDATE_SUCCESS:
          this.emit(ACL_USER_UPDATE_SUCCESS, action.userID);
          break;
        case REQUEST_ACL_USER_UPDATE_ERROR:
          this.emit(ACL_USER_UPDATE_ERROR, action.data, action.userID);
          break;
        // Delete user
        case REQUEST_ACL_USER_DELETE_SUCCESS:
          this.emit(ACL_USER_DELETE_SUCCESS, action.userID);
          break;
        case REQUEST_ACL_USER_DELETE_ERROR:
          this.emit(ACL_USER_DELETE_ERROR, action.data, action.userID);
          break;
      }
    });
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState().users[prop];
  }

  getUserRaw(userID) {
    return this.get("userDetail")[userID];
  }

  getUser(userID) {
    return new User(this.getUserRaw(userID) || {});
  }

  setUser(userID, user) {
    const users = this.get("userDetail");
    users[userID] = user;
    SDK.getSDK().dispatch({
      type: ACL_USER_SET_USER,
      users,
    });
  }

  fetchUser(...args) {
    return ACLUsersActions.fetchUser(...args);
  }

  addLDAPUser(...args) {
    return ACLUsersActions.addLDAPUser(...args);
  }

  updateUser(...args) {
    return ACLUsersActions.updateUser(...args);
  }

  /**
   * Will fetch a user and their details.
   * Will make a request to various different endpoints to get all details
   *
   * @param  {Number} userID
   */
  fetchUserWithDetails(userID) {
    const usersFetching = this.get("usersFetching");

    usersFetching[userID] = { user: false, groups: false, permissions: false };
    SDK.getSDK().dispatch({
      type: ACL_USER_DETAILS_FETCH_START,
      usersFetching,
    });

    ACLUsersActions.fetchUser(userID);
    ACLUsersActions.fetchUserGroups(userID);
    ACLUsersActions.fetchUserPermissions(userID);
  }

  /**
   * Validates if the details for a user have been successfully fetched
   *
   * @param  {Number} userID
   * @param  {String} type The type of detail that has been successfully
   *   received
   */
  validateUserWithDetailsFetch(userID, type) {
    const usersFetching = this.get("usersFetching");
    if (usersFetching[userID] == null) {
      return;
    }

    usersFetching[userID][type] = true;

    let fetchedAll = true;
    Object.keys(usersFetching[userID]).forEach((key) => {
      if (usersFetching[userID][key] === false) {
        fetchedAll = false;
      }
    });

    if (fetchedAll === true) {
      delete usersFetching[userID];
      SDK.getSDK().dispatch({
        type: ACL_USER_DETAILS_FETCHED_SUCCESS,
        usersFetching,
      });
      this.emit(ACL_USER_DETAILS_FETCHED_SUCCESS, userID);
    }
  }

  /**
   * Emits error if we're in the process of fetching details for a user
   * but one of the requests fails.
   *
   * @param  {Number} userID
   */
  invalidateUserWithDetailsFetch(userID) {
    const usersFetching = this.get("usersFetching");
    if (usersFetching[userID] == null) {
      return;
    }

    delete usersFetching[userID];
    SDK.getSDK().dispatch({
      type: ACL_USER_DETAILS_FETCHED_ERROR,
      usersFetching,
    });
    this.emit(ACL_USER_DETAILS_FETCHED_ERROR, userID);
  }

  /**
   * Process a user response
   *
   * @param  {Object} userData see /acl/users/user schema
   */
  processUser(userData) {
    let user = this.getUserRaw(userData.uid) || {};

    user = { ...user, ...userData };

    this.setUser(user.uid, user);
    this.emit(ACL_USER_DETAILS_USER_CHANGE, user.uid);

    this.validateUserWithDetailsFetch(user.uid, "user");
  }

  processUserError(userID) {
    this.emit(ACL_USER_DETAILS_USER_ERROR, userID);
    this.invalidateUserWithDetailsFetch(userID);
  }

  /**
   * Process a user groups response
   *
   * @param  {Object} groups see /acl/users/user/groups schema
   * @param  {Object} userID
   */
  processUserGroups(groups, userID) {
    const user = this.getUserRaw(userID) || {};

    user.groups = groups;

    // Use userID throughout as the user may not have been previously set
    this.setUser(userID, user);
    this.emit(ACL_USER_DETAILS_GROUPS_CHANGE, userID);

    this.validateUserWithDetailsFetch(userID, "groups");
  }

  processUserGroupsError(userID) {
    this.emit(ACL_USER_DETAILS_GROUPS_ERROR, userID);
    this.invalidateUserWithDetailsFetch(userID);
  }

  /**
   * Process a user permissions response
   *
   * @param  {Object} permissions see /acl/users/user/permissions schema
   * @param  {Object} userID
   */
  processUserPermissions(permissions, userID) {
    const user = this.getUserRaw(userID) || {};

    user.permissions = permissions;

    // Use userID throughout as the user may not have been previously set
    this.setUser(userID, user);
    this.emit(ACL_USER_DETAILS_PERMISSIONS_CHANGE, userID);

    this.validateUserWithDetailsFetch(userID, "permissions");
  }

  processUserPermissionsError(userID) {
    this.emit(ACL_USER_DETAILS_PERMISSIONS_ERROR, userID);
    this.invalidateUserWithDetailsFetch(userID);
  }
}

export default new ACLUserStore();
