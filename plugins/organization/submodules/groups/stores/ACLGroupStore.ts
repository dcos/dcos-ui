import BaseStore from "#SRC/js/stores/BaseStore";

import {
  REQUEST_ACL_GROUP_SUCCESS,
  REQUEST_ACL_GROUP_ERROR,
  REQUEST_ACL_GROUP_PERMISSIONS_SUCCESS,
  REQUEST_ACL_GROUP_PERMISSIONS_ERROR,
  REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_SUCCESS,
  REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_ERROR,
  REQUEST_ACL_GROUP_USERS_SUCCESS,
  REQUEST_ACL_GROUP_USERS_ERROR,
  REQUEST_ACL_GROUP_CREATE_SUCCESS,
  REQUEST_ACL_GROUP_CREATE_ERROR,
  REQUEST_ACL_LDAP_GROUP_CREATE_SUCCESS,
  REQUEST_ACL_LDAP_GROUP_CREATE_PARTIAL_SUCCESS,
  REQUEST_ACL_LDAP_GROUP_CREATE_ERROR,
  REQUEST_ACL_GROUP_UPDATE_SUCCESS,
  REQUEST_ACL_GROUP_UPDATE_ERROR,
  REQUEST_ACL_GROUP_DELETE_SUCCESS,
  REQUEST_ACL_GROUP_DELETE_ERROR,
  REQUEST_ACL_GROUP_ADD_USER_SUCCESS,
  REQUEST_ACL_GROUP_ADD_USER_ERROR,
  REQUEST_ACL_GROUP_REMOVE_USER_SUCCESS,
  REQUEST_ACL_GROUP_REMOVE_USER_ERROR,
} from "../constants/ActionTypes";

import {
  ACL_GROUP_SET_GROUPS,
  ACL_GROUP_SET_GROUPS_FETCHING,
  ACL_GROUP_DETAILS_FETCHED_SUCCESS,
  ACL_GROUP_DETAILS_FETCHED_ERROR,
  ACL_GROUP_DETAILS_GROUP_CHANGE,
  ACL_GROUP_DETAILS_GROUP_ERROR,
  ACL_GROUP_DETAILS_PERMISSIONS_CHANGE,
  ACL_GROUP_DETAILS_PERMISSIONS_ERROR,
  ACL_GROUP_DETAILS_SERVICE_ACCOUNTS_CHANGE,
  ACL_GROUP_DETAILS_SERVICE_ACCOUNTS_ERROR,
  ACL_GROUP_DETAILS_USERS_CHANGE,
  ACL_GROUP_DETAILS_USERS_ERROR,
  ACL_GROUP_CREATE_SUCCESS,
  ACL_GROUP_CREATE_ERROR,
  ACL_LDAP_GROUP_CREATE_SUCCESS,
  ACL_LDAP_GROUP_CREATE_PARTIAL_SUCCESS,
  ACL_LDAP_GROUP_CREATE_ERROR,
  ACL_GROUP_UPDATE_SUCCESS,
  ACL_GROUP_UPDATE_ERROR,
  ACL_GROUP_DELETE_SUCCESS,
  ACL_GROUP_DELETE_ERROR,
  ACL_GROUP_USERS_CHANGED,
  ACL_GROUP_ADD_USER_ERROR,
  ACL_GROUP_REMOVE_USER_SUCCESS,
  ACL_GROUP_REMOVE_USER_ERROR,
} from "../constants/EventTypes";

import ACLGroupsActions from "../actions/ACLGroupsActions";
import Group from "../structs/Group";
import ServiceAccountList from "../../service-accounts/structs/ServiceAccountList";
import User from "../../users/structs/User";

const SDK = require("../../../SDK");

SDK.getSDK().Hooks.addFilter("serverErrorModalListeners", (listeners) => {
  listeners.push({ name: "aclGroup", events: ["updateError", "deleteError"] });

  return listeners;
});

/**
 * This store will keep track of groups and their details
 */
class ACLGroupStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "aclGroup",
      events: {
        success: ACL_GROUP_DETAILS_GROUP_CHANGE,
        error: ACL_GROUP_DETAILS_GROUP_ERROR,
        addUserSuccess: ACL_GROUP_USERS_CHANGED,
        addUserError: ACL_GROUP_ADD_USER_ERROR,
        createSuccess: ACL_GROUP_CREATE_SUCCESS,
        createError: ACL_GROUP_CREATE_ERROR,
        createLDAPSuccess: ACL_LDAP_GROUP_CREATE_SUCCESS,
        createLDAPPartialSuccess: ACL_LDAP_GROUP_CREATE_PARTIAL_SUCCESS,
        createLDAPError: ACL_LDAP_GROUP_CREATE_ERROR,
        updateError: ACL_GROUP_UPDATE_ERROR,
        updateSuccess: ACL_GROUP_UPDATE_SUCCESS,
        permissionsSuccess: ACL_GROUP_DETAILS_PERMISSIONS_CHANGE,
        permissionsError: ACL_GROUP_DETAILS_PERMISSIONS_ERROR,
        serviceAccountsSuccess: ACL_GROUP_DETAILS_SERVICE_ACCOUNTS_CHANGE,
        serviceAccountsError: ACL_GROUP_DETAILS_SERVICE_ACCOUNTS_ERROR,
        usersSuccess: ACL_GROUP_DETAILS_USERS_CHANGE,
        usersError: ACL_GROUP_DETAILS_USERS_ERROR,
        fetchedDetailsSuccess: ACL_GROUP_DETAILS_FETCHED_SUCCESS,
        fetchedDetailsError: ACL_GROUP_DETAILS_FETCHED_ERROR,
        deleteUserSuccess: ACL_GROUP_REMOVE_USER_SUCCESS,
        deleteUserError: ACL_GROUP_REMOVE_USER_ERROR,
        deleteSuccess: ACL_GROUP_DELETE_SUCCESS,
        deleteError: ACL_GROUP_DELETE_ERROR,
      },
      unmountWhen: () => false,
    });

    SDK.getSDK().onDispatch((action) => {
      switch (action.type) {
        // Get group details
        case REQUEST_ACL_GROUP_SUCCESS:
          this.processGroup(action.data);
          break;
        case REQUEST_ACL_GROUP_ERROR:
          this.processGroupError(action.data, action.groupID);
          break;
        // Get ACL permissions of group
        case REQUEST_ACL_GROUP_PERMISSIONS_SUCCESS:
          this.processGroupPermissions(action.data, action.groupID);
          break;
        case REQUEST_ACL_GROUP_PERMISSIONS_ERROR:
          this.processGroupPermissionsError(action.data, action.groupID);
          break;
        case REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_SUCCESS:
          this.processGroupServiceAccounts(action.data, action.groupID);
          break;
        case REQUEST_ACL_GROUP_SERVICE_ACCOUNTS_ERROR:
          this.processGroupServiceAccountsError(action.data, action.groupID);
          break;
        // Get users members of group
        case REQUEST_ACL_GROUP_USERS_SUCCESS:
          this.processGroupUsers(action.data, action.groupID);
          break;
        case REQUEST_ACL_GROUP_USERS_ERROR:
          this.processGroupUsersError(action.data, action.groupID);
          break;
        // Create group
        case REQUEST_ACL_GROUP_CREATE_SUCCESS:
          this.emit(ACL_GROUP_CREATE_SUCCESS, action.groupID);
          break;
        case REQUEST_ACL_GROUP_CREATE_ERROR:
          this.emit(ACL_GROUP_CREATE_ERROR, action.data, action.groupID);
          break;
        // Import LDAP Group
        case REQUEST_ACL_LDAP_GROUP_CREATE_SUCCESS:
          this.emit(ACL_LDAP_GROUP_CREATE_SUCCESS, action.groupID);
          break;
        case REQUEST_ACL_LDAP_GROUP_CREATE_PARTIAL_SUCCESS:
          this.emit(
            ACL_LDAP_GROUP_CREATE_PARTIAL_SUCCESS,
            action.data,
            action.groupID
          );
          break;
        case REQUEST_ACL_LDAP_GROUP_CREATE_ERROR:
          this.emit(ACL_LDAP_GROUP_CREATE_ERROR, action.data, action.groupID);
          break;
        // Update group
        case REQUEST_ACL_GROUP_UPDATE_SUCCESS:
          this.emit(ACL_GROUP_UPDATE_SUCCESS, action.groupID);
          break;
        case REQUEST_ACL_GROUP_UPDATE_ERROR:
          this.emit(ACL_GROUP_UPDATE_ERROR, action.data, action.groupID);
          break;
        // Delete group
        case REQUEST_ACL_GROUP_DELETE_SUCCESS:
          this.emit(ACL_GROUP_DELETE_SUCCESS, action.groupID);
          break;
        case REQUEST_ACL_GROUP_DELETE_ERROR:
          this.emit(ACL_GROUP_DELETE_ERROR, action.data, action.groupID);
          break;
        // Add user to group
        case REQUEST_ACL_GROUP_ADD_USER_SUCCESS:
          this.emit(ACL_GROUP_USERS_CHANGED, action.groupID, action.userID);
          break;
        case REQUEST_ACL_GROUP_ADD_USER_ERROR:
          this.emit(
            ACL_GROUP_ADD_USER_ERROR,
            action.data,
            action.groupID,
            action.userID
          );
          break;
        // Remove user from group
        case REQUEST_ACL_GROUP_REMOVE_USER_SUCCESS:
          this.emit(
            ACL_GROUP_REMOVE_USER_SUCCESS,
            action.groupID,
            action.userID
          );
          break;
        case REQUEST_ACL_GROUP_REMOVE_USER_ERROR:
          this.emit(
            ACL_GROUP_REMOVE_USER_ERROR,
            action.data,
            action.groupID,
            action.userID
          );
          break;
      }
    });
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState().groups[prop];
  }

  getGroupRaw(groupID) {
    return this.get("groupDetail")[groupID];
  }

  getGroup(groupID) {
    return new Group(this.getGroupRaw(groupID));
  }

  getServiceAccounts(groupID) {
    const items = (this.getGroupRaw(groupID).serviceAccounts || []).map(
      (user) => user.user
    );

    return new ServiceAccountList({ items });
  }

  getUsers(groupID) {
    return (this.getGroupRaw(groupID).users || []).map(
      ({ user }) => new User(user)
    );
  }

  setGroup(groupID, group) {
    const groups = this.get("groupDetail");
    groups[groupID] = group;
    SDK.getSDK().dispatch({
      type: ACL_GROUP_SET_GROUPS,
      groups,
    });
  }

  fetchGroup(...args) {
    return ACLGroupsActions.fetchGroup(...args);
  }

  addGroup(...args) {
    return ACLGroupsActions.addGroup(...args);
  }

  addLDAPGroup(...args) {
    return ACLGroupsActions.addLDAPGroup(...args);
  }

  updateGroup(...args) {
    return ACLGroupsActions.updateGroup(...args);
  }

  deleteGroup(...args) {
    return ACLGroupsActions.deleteGroup(...args);
  }

  addUser(...args) {
    return ACLGroupsActions.addUser(...args);
  }

  deleteUser(...args) {
    return ACLGroupsActions.deleteUser(...args);
  }

  /**
   * Will fetch a group and their details.
   * Will make a request to various different endpoints to get all details
   *
   * @param  {Number} groupID
   */
  fetchGroupWithDetails(groupID) {
    const groupsFetching = this.get("groupsFetching");
    groupsFetching[groupID] = {
      group: false,
      serviceAccounts: false,
      users: false,
      permissions: false,
    };

    SDK.getSDK().dispatch({
      type: ACL_GROUP_SET_GROUPS_FETCHING,
      groupsFetching,
    });

    ACLGroupsActions.fetchGroup(groupID);
    ACLGroupsActions.fetchGroupPermissions(groupID);
    ACLGroupsActions.fetchGroupServiceAccounts(groupID);
    ACLGroupsActions.fetchGroupUsers(groupID);
  }

  /**
   * Validates if the details for a group have been successfully fetched
   *
   * @param  {Number} groupID
   * @param  {String} type The type of detail that has been successfully
   *   received
   */
  validateGroupWithDetailsFetch(groupID, type) {
    const groupsFetching = this.get("groupsFetching");
    if (groupsFetching[groupID] == null) {
      return;
    }

    groupsFetching[groupID][type] = true;

    let fetchedAll = true;
    Object.keys(groupsFetching[groupID]).forEach((key) => {
      if (groupsFetching[groupID][key] === false) {
        fetchedAll = false;
      }
    });

    if (fetchedAll) {
      delete groupsFetching[groupID];
      SDK.getSDK().dispatch({
        type: ACL_GROUP_SET_GROUPS_FETCHING,
        groupsFetching,
      });
      this.emit(ACL_GROUP_DETAILS_FETCHED_SUCCESS, groupID);
    }
  }

  /**
   * Emits error if we're in the process of fetching details for a group
   * but one of the requests fails.
   *
   * @param  {Number} groupID
   */
  invalidateGroupWithDetailsFetch(groupID) {
    const groupsFetching = this.get("groupsFetching");
    if (groupsFetching[groupID] == null) {
      return;
    }

    delete groupsFetching[groupID];
    SDK.getSDK().dispatch({
      type: ACL_GROUP_SET_GROUPS_FETCHING,
      groupsFetching,
    });
    this.emit(ACL_GROUP_DETAILS_FETCHED_ERROR, groupID);
  }

  /**
   * Process a group response
   *
   * @param  {Object} groupData see /acl/groups/group schema
   */
  processGroup(groupData) {
    let group = this.getGroupRaw(groupData.gid) || {};

    group = { ...group, ...groupData };

    this.setGroup(group.gid, group);
    this.emit(ACL_GROUP_DETAILS_GROUP_CHANGE, group.gid);

    this.validateGroupWithDetailsFetch(group.gid, "group");
  }

  processGroupError(data, groupID) {
    this.emit(ACL_GROUP_DETAILS_GROUP_ERROR, data, groupID);
    this.invalidateGroupWithDetailsFetch(groupID);
  }

  /**
   * Process a group permissions response
   *
   * @param  {Object} permissions see /acl/groups/group/permissions schema
   * @param  {Object} groupID
   */
  processGroupPermissions(permissions, groupID) {
    const group = this.getGroupRaw(groupID) || {};

    group.permissions = permissions;

    // Use groupID throughout as the group may not have been previously set
    this.setGroup(groupID, group);
    this.emit(ACL_GROUP_DETAILS_PERMISSIONS_CHANGE, groupID);

    this.validateGroupWithDetailsFetch(groupID, "permissions");
  }

  processGroupPermissionsError(data, groupID) {
    this.emit(ACL_GROUP_DETAILS_PERMISSIONS_ERROR, data, groupID);
    this.invalidateGroupWithDetailsFetch(groupID);
  }

  processGroupServiceAccounts(serviceAccounts, groupID) {
    const group = this.getGroupRaw(groupID) || {};

    group.serviceAccounts = serviceAccounts;

    // Use groupID throughout as the group may not have been previously set
    this.setGroup(groupID, group);
    this.emit(ACL_GROUP_DETAILS_SERVICE_ACCOUNTS_CHANGE, groupID);

    this.validateGroupWithDetailsFetch(groupID, "serviceAccounts");
  }

  processGroupServiceAccountsError(data, groupID) {
    this.emit(ACL_GROUP_DETAILS_SERVICE_ACCOUNTS_ERROR, data, groupID);
    this.invalidateGroupWithDetailsFetch(groupID);
  }

  /**
   * Process a group users response
   *
   * @param  {Object} users see /acl/groups/group/users schema
   * @param  {Object} groupID
   */
  processGroupUsers(users, groupID) {
    const group = this.getGroupRaw(groupID) || {};

    group.users = users;

    // Use groupID throughout as the group may not have been previously set
    this.setGroup(groupID, group);
    this.emit(ACL_GROUP_DETAILS_USERS_CHANGE, groupID);

    this.validateGroupWithDetailsFetch(groupID, "users");
  }

  processGroupUsersError(data, groupID) {
    this.emit(ACL_GROUP_DETAILS_USERS_ERROR, data, groupID);
    this.invalidateGroupWithDetailsFetch(groupID);
  }
}

export default new ACLGroupStore();
