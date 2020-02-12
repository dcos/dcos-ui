import { EventEmitter } from "events";
import { ClassMixin } from "mesosphere-shared-reactjs";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import {
  REQUEST_PERMISSIONS_SUCCESS,
  REQUEST_PERMISSIONS_ERROR
} from "../constants/ActionTypes";
import { ACL_AUTH_USER_PERMISSIONS_CHANGED } from "../constants/EventTypes";
import ACLAuthenticatedUserActions from "../events/ACLAuthenticatedUserActions";
import PluginSDK from "PluginSDK";

let Store: ACLAuthenticatedUserStore | null = null;

export default SDK => Store || (Store = new ACLAuthenticatedUserStore(SDK));

class ACLAuthenticatedUserStore extends ClassMixin(EventEmitter, StoreMixin) {
  constructor(SDK) {
    super(SDK);

    SDK.addStoreConfig({
      store: this,
      storeID: "aclAuthenticatedUser",
      events: {
        permissionsChanged: ACL_AUTH_USER_PERMISSIONS_CHANGED
      },
      unmountWhen: () => false
    });

    SDK.onDispatch(action => {
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
    const { permissions } = PluginSDK.Store.getState().authentication;
    const user = PluginSDK.Hooks.applyFilter("instantiateUserStruct", {
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
    PluginSDK.dispatch({
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
    PluginSDK.dispatch({
      type: ACL_AUTH_USER_PERMISSIONS_CHANGED,
      permissions: { direct: [], groups: [] }
    });
  }

  onAuthStoreLogoutSuccess() {
    this.resetPermissions();
  }
}
