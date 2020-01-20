import { EventEmitter } from "events";
import { ClassMixin } from "mesosphere-shared-reactjs";

import StoreMixin from "#SRC/js/mixins/StoreMixin";

import {
  REQUEST_PERMISSIONS_SUCCESS,
  REQUEST_PERMISSIONS_ERROR
} from "../constants/ActionTypes";

import { ACL_AUTH_USER_PERMISSIONS_CHANGED } from "../constants/EventTypes";

import ACLAuthenticatedUserActions from "../events/ACLAuthenticatedUserActions";

const SDK = require("../SDK");

class ACLAuthenticatedUserStore extends ClassMixin(EventEmitter, StoreMixin) {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "aclAuthenticatedUser",
      events: {
        permissionsChanged: ACL_AUTH_USER_PERMISSIONS_CHANGED
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      switch (action.type) {
        case REQUEST_PERMISSIONS_SUCCESS:
          this.processPermissionsSuccess(action.data);
          break;
        case REQUEST_PERMISSIONS_ERROR:
          this.processPermissionsError(action.data);
          break;
      }
    });

    this.store_initializeListeners([
      {
        name: "auth",
        events: ["success", "logoutSuccess"]
      }
    ]);
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  getPermissions() {
    const permissions = SDK.getSDK().Store.getOwnState().permissions;
    const user = SDK.getSDK().Hooks.applyFilter("instantiateUserStruct", {
      permissions
    });

    return user.getUniquePermissions().reduce((memo, permission) => {
      memo[permission.rid] = permission;

      return memo;
    }, {});
  }

  fetchPermissions(...args) {
    return ACLAuthenticatedUserActions.fetchPermissions(...args);
  }

  processPermissionsSuccess(permissions) {
    SDK.getSDK().dispatch({
      type: ACL_AUTH_USER_PERMISSIONS_CHANGED,
      permissions
    });
    this.emit(ACL_AUTH_USER_PERMISSIONS_CHANGED);
  }

  processPermissionsError() {
    this.resetPermissions();
    this.emit(ACL_AUTH_USER_PERMISSIONS_CHANGED);
  }

  resetPermissions() {
    SDK.getSDK().dispatch({
      type: ACL_AUTH_USER_PERMISSIONS_CHANGED,
      permissions: { direct: [], groups: [] }
    });
  }

  onAuthStoreLogoutSuccess() {
    this.resetPermissions();
  }
}

export default new ACLAuthenticatedUserStore();
