import BaseStore from "#SRC/js/stores/BaseStore";
import List from "#SRC/js/structs/List";

import {
  REQUEST_ACL_DIRECTORIES_SUCCESS,
  REQUEST_ACL_DIRECTORIES_ERROR,
  REQUEST_ACL_DIRECTORY_ADD_SUCCESS,
  REQUEST_ACL_DIRECTORY_ADD_ERROR,
  REQUEST_ACL_DIRECTORY_DELETE_SUCCESS,
  REQUEST_ACL_DIRECTORY_DELETE_ERROR,
  REQUEST_ACL_DIRECTORY_TEST_SUCCESS,
  REQUEST_ACL_DIRECTORY_TEST_ERROR
} from "../constants/ActionTypes";

import {
  ACL_DIRECTORIES_CHANGED,
  ACL_DIRECTORIES_ERROR,
  ACL_DIRECTORY_ADD_SUCCESS,
  ACL_DIRECTORY_ADD_ERROR,
  ACL_DIRECTORY_DELETE_SUCCESS,
  ACL_DIRECTORY_DELETE_ERROR,
  ACL_DIRECTORY_TEST_SUCCESS,
  ACL_DIRECTORY_TEST_ERROR
} from "../constants/EventTypes";

import ACLDirectoriesActions from "../actions/ACLDirectoriesActions";

const SDK = require("../../../SDK");

SDK.getSDK().Hooks.addFilter("serverErrorModalListeners", listeners => {
  listeners.push({ name: "aclDirectories", events: ["addError", "testError"] });

  return listeners;
});

class ACLDirectoriesStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "aclDirectories",
      events: {
        fetchSuccess: ACL_DIRECTORIES_CHANGED,
        fetchError: ACL_DIRECTORIES_ERROR,
        addSuccess: ACL_DIRECTORY_ADD_SUCCESS,
        addError: ACL_DIRECTORY_ADD_ERROR,
        deleteSuccess: ACL_DIRECTORY_DELETE_SUCCESS,
        deleteError: ACL_DIRECTORY_DELETE_ERROR,
        testSuccess: ACL_DIRECTORY_TEST_SUCCESS,
        testError: ACL_DIRECTORY_TEST_ERROR
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      const { data, type } = action;

      switch (type) {
        // Get a list of external directories
        case REQUEST_ACL_DIRECTORIES_SUCCESS:
          this.processDirectoriesSuccess(data);
          break;
        case REQUEST_ACL_DIRECTORIES_ERROR:
          this.emit(ACL_DIRECTORIES_ERROR, data);
          break;
        case REQUEST_ACL_DIRECTORY_ADD_SUCCESS:
          this.emit(ACL_DIRECTORY_ADD_SUCCESS);
          break;
        case REQUEST_ACL_DIRECTORY_ADD_ERROR:
          this.emit(ACL_DIRECTORY_ADD_ERROR, data);
          break;
        case REQUEST_ACL_DIRECTORY_DELETE_SUCCESS:
          this.processDirectoriesSuccess([]);
          this.emit(ACL_DIRECTORY_DELETE_SUCCESS);
          break;
        case REQUEST_ACL_DIRECTORY_DELETE_ERROR:
          this.emit(ACL_DIRECTORY_DELETE_ERROR, data);
          break;
        case REQUEST_ACL_DIRECTORY_TEST_SUCCESS:
          this.emit(ACL_DIRECTORY_TEST_SUCCESS, data);
          break;
        case REQUEST_ACL_DIRECTORY_TEST_ERROR:
          this.emit(ACL_DIRECTORY_TEST_ERROR, data);
          break;
      }
    });
  }

  addDirectory(...args) {
    return ACLDirectoriesActions.addDirectory(...args);
  }

  deleteDirectory(...args) {
    return ACLDirectoriesActions.deleteDirectory(...args);
  }

  testDirectoryConnection(...args) {
    return ACLDirectoriesActions.testDirectoryConnection(...args);
  }

  fetchDirectories(...args) {
    return ACLDirectoriesActions.fetchDirectories(...args);
  }

  processDirectoriesSuccess(directories) {
    SDK.getSDK().dispatch({
      type: ACL_DIRECTORIES_CHANGED,
      directories
    });
    this.emit(ACL_DIRECTORIES_CHANGED);
  }

  getDirectories() {
    return new List({
      items: SDK.getSDK().Store.getOwnState().directories.list
    });
  }
}

export default new ACLDirectoriesStore();
