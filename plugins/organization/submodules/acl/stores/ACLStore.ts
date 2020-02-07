import BaseStore from "#SRC/js/stores/BaseStore";

import {
  REQUEST_ACL_CREATE_ERROR,
  REQUEST_ACL_CREATE_SUCCESS,
  REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
  REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
  REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
  REQUEST_ACL_RESOURCE_ACLS_ERROR,
  REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
  REQUEST_ACL_SCHEMA_ERROR,
  REQUEST_ACL_SCHEMA_SUCCESS,
  REQUEST_ACL_USER_GRANT_ACTION_ERROR,
  REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
  REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS
} from "../constants/ActionTypes";

import {
  ACL_CREATE_ERROR,
  ACL_CREATE_SUCCESS,
  ACL_GROUP_GRANT_ACTION_CHANGE,
  ACL_GROUP_GRANT_ACTION_ERROR,
  ACL_GROUP_REVOKE_ACTION_CHANGE,
  ACL_GROUP_REVOKE_ACTION_ERROR,
  ACL_RESOURCE_ACLS_CHANGE,
  ACL_RESOURCE_ACLS_ERROR,
  ACL_SCHEMA_CHANGE,
  ACL_SCHEMA_ERROR,
  ACL_USER_GRANT_ACTION_CHANGE,
  ACL_USER_GRANT_ACTION_ERROR,
  ACL_USER_REVOKE_ACTION_CHANGE,
  ACL_USER_REVOKE_ACTION_ERROR
} from "../constants/EventTypes";

import ACLActions from "../actions/ACLActions";
import ACLList from "../structs/ACLList";
import PermissionTree from "../structs/PermissionTree";

const SDK = require("../../../SDK");

SDK.getSDK().Hooks.addFilter("serverErrorModalListeners", listeners => {
  // prettier-ignore
  listeners.push({name: "acl", events: ["userRevokeError", "groupRevokeError"]});

  return listeners;
});

class ACLStore extends BaseStore {
  constructor(...args) {
    super(...args);

    this.outstandingGrants = {};

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "acl",
      events: {
        createSuccess: ACL_CREATE_SUCCESS,
        createError: ACL_CREATE_ERROR,
        fetchResourceSuccess: ACL_RESOURCE_ACLS_CHANGE,
        fetchResourceError: ACL_RESOURCE_ACLS_ERROR,
        fetchSchemaSuccess: ACL_SCHEMA_CHANGE,
        fetchSchemaError: ACL_SCHEMA_ERROR,
        userGrantSuccess: ACL_USER_GRANT_ACTION_CHANGE,
        userGrantError: ACL_USER_GRANT_ACTION_ERROR,
        userRevokeSuccess: ACL_USER_REVOKE_ACTION_CHANGE,
        userRevokeError: ACL_USER_REVOKE_ACTION_ERROR,
        groupGrantSuccess: ACL_GROUP_GRANT_ACTION_CHANGE,
        groupGrantError: ACL_GROUP_GRANT_ACTION_ERROR,
        groupRevokeSuccess: ACL_GROUP_REVOKE_ACTION_CHANGE,
        groupRevokeError: ACL_GROUP_REVOKE_ACTION_ERROR
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      switch (action.type) {
        // Create ACL for resource
        case REQUEST_ACL_CREATE_SUCCESS:
          this.fetchACLs();
          this.emit(ACL_CREATE_SUCCESS, action.resourceID);
          break;
        case REQUEST_ACL_CREATE_ERROR:
          this.removeAllOutstandingGrantRequests(action.resourceID);
          this.emit(ACL_CREATE_ERROR, action.data, action.resourceID);
          break;
        // Get ACLs for resource
        case REQUEST_ACL_RESOURCE_ACLS_SUCCESS:
          this.processResourcesACLs(action.data, action.resourceType);
          break;
        case REQUEST_ACL_RESOURCE_ACLS_ERROR:
          this.emit(ACL_RESOURCE_ACLS_ERROR, action.data, action.resourceType);
          break;
        // Get ACL Schema for adding permissions
        case REQUEST_ACL_SCHEMA_SUCCESS:
          this.processACLSchema(action.data);
          break;
        case REQUEST_ACL_SCHEMA_ERROR:
          this.emit(ACL_SCHEMA_ERROR, action.data);
          break;
        // Grant permission for user
        case REQUEST_ACL_USER_GRANT_ACTION_SUCCESS:
          this.emit(ACL_USER_GRANT_ACTION_CHANGE, action.triple);
          break;
        case REQUEST_ACL_USER_GRANT_ACTION_ERROR:
          this.emit(
            ACL_USER_GRANT_ACTION_ERROR,
            action.data,
            action.triple,
            action.xhr
          );
          break;
        // Revoke permission for user
        case REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS:
          this.emit(ACL_USER_REVOKE_ACTION_CHANGE, action.triple);
          break;
        case REQUEST_ACL_USER_REVOKE_ACTION_ERROR:
          this.emit(ACL_USER_REVOKE_ACTION_ERROR, action.data, action.triple);
          break;
        // Grant permission for group
        case REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS:
          this.emit(ACL_GROUP_GRANT_ACTION_CHANGE, action.triple);
          break;
        case REQUEST_ACL_GROUP_GRANT_ACTION_ERROR:
          this.emit(
            ACL_GROUP_GRANT_ACTION_ERROR,
            action.data,
            action.triple,
            action.xhr
          );
          break;
        // Revoke permission for group
        case REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS:
          this.emit(ACL_GROUP_REVOKE_ACTION_CHANGE, action.triple);
          break;
        case REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR:
          this.emit(ACL_GROUP_REVOKE_ACTION_ERROR, action.data, action.triple);
          break;
      }
    });
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState().acl[prop];
  }

  createACLForResource(...args) {
    return ACLActions.createACLForResource(...args);
  }

  fetchACLs(...args) {
    return ACLActions.fetchACLs(...args);
  }

  fetchACLSchema(...args) {
    return ACLActions.fetchACLSchema(...args);
  }

  grantUserActionToResource(...args) {
    this.safeGrantRequest(ACLActions.grantUserActionToResource, ...args);
  }

  revokeUserActionToResource(...args) {
    return ACLActions.revokeUserActionToResource(...args);
  }

  grantGroupActionToResource(...args) {
    this.safeGrantRequest(ACLActions.grantGroupActionToResource, ...args);
  }

  revokeGroupActionToResource(...args) {
    return ACLActions.revokeGroupActionToResource(...args);
  }

  getACLs(resourceType = "allACLs") {
    return new ACLList({ items: this.get(resourceType) || [] });
  }

  hasACL(resourceType, resourceID) {
    return this.getACLs(resourceType).getItem(resourceID) !== undefined;
  }

  getPermissionSchema() {
    return new PermissionTree(this.get("permissionSchema"));
  }

  addOutstandingGrantRequest(resourceID, cb) {
    if (!(resourceID in this.outstandingGrants)) {
      this.outstandingGrants[resourceID] = [];
    }
    this.outstandingGrants[resourceID].push(cb);
  }

  removeAllOutstandingGrantRequests(resourceID) {
    delete this.outstandingGrants[resourceID];
  }

  safeGrantRequest(
    aclActionFn,
    subjectID,
    actions,
    resourceID,
    resourceType = "allACLs"
  ) {
    // Turn actions into array if it isn't
    if (Array.isArray(actions) === false) {
      actions = [actions];
    }

    // First check if ACL exists before requesting grant
    if (this.hasACL(resourceType, resourceID)) {
      actions.forEach(action => {
        aclActionFn(subjectID, action, resourceID);
      });

      return;
    }

    // Add grant request to callback list and create ACL
    this.addOutstandingGrantRequest(resourceID, () => {
      actions.forEach(action => {
        aclActionFn(subjectID, action, resourceID);
      });
    });

    const ACLObject = { description: resourceID };
    if (/^service/.test(resourceID)) {
      ACLObject.description = resourceID.split(".")[1] + " service";
    }

    this.createACLForResource(resourceID, ACLObject);
  }

  processOutstandingGrants(resourceType) {
    this.getACLs(resourceType)
      .getItems()
      .forEach(acl => {
        const resourceID = acl.get("rid");
        if (resourceID in this.outstandingGrants) {
          // Run grant requests now that we have an ACL
          this.outstandingGrants[resourceID].forEach(cb => {
            cb();
          });
          this.removeAllOutstandingGrantRequests(resourceID);
        }
      });
  }

  processResourcesACLs(items = [], resourceType = "allACLs") {
    SDK.getSDK().dispatch({
      type: ACL_RESOURCE_ACLS_CHANGE,
      data: { [resourceType]: items }
    });
    this.emit(ACL_RESOURCE_ACLS_CHANGE);
    this.processOutstandingGrants(resourceType);
  }

  processACLSchema(permissionSchema) {
    SDK.getSDK().dispatch({
      type: ACL_SCHEMA_CHANGE,
      data: { permissionSchema }
    });
    this.emit(ACL_SCHEMA_CHANGE);
  }
}

export default new ACLStore();
