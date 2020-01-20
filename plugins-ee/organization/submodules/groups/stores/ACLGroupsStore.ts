import BaseStore from "#SRC/js/stores/BaseStore";
import {
  REQUEST_ACL_GROUPS_SUCCESS,
  REQUEST_ACL_GROUPS_ERROR
} from "../constants/ActionTypes";

import {
  ACL_GROUPS_CHANGE,
  ACL_GROUPS_REQUEST_ERROR
} from "../constants/EventTypes";

import ACLGroupsActions from "../actions/ACLGroupsActions";

import GroupsList from "../structs/GroupsList";

const SDK = require("../../../SDK");

class ACLGroupsStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "aclGroups",
      events: {
        success: ACL_GROUPS_CHANGE,
        error: ACL_GROUPS_REQUEST_ERROR
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      switch (action.type) {
        case REQUEST_ACL_GROUPS_SUCCESS:
          this.processGroups(action.data);
          break;
        case REQUEST_ACL_GROUPS_ERROR:
          this.processGroupsError(action.data);
          break;
      }

      return true;
    });
  }

  fetchGroups(...args) {
    return ACLGroupsActions.fetch(...args);
  }

  getGroups() {
    return new GroupsList({
      items: SDK.getSDK().Store.getOwnState().groups.groups
    });
  }

  processGroups(groups) {
    SDK.getSDK().dispatch({
      type: ACL_GROUPS_CHANGE,
      groups
    });
    this.emit(ACL_GROUPS_CHANGE);
  }

  processGroupsError(error) {
    this.emit(ACL_GROUPS_REQUEST_ERROR, error);
  }
}

export default new ACLGroupsStore();
