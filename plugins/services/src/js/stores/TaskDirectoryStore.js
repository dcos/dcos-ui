import PluginSDK from 'PluginSDK';
import {
  REQUEST_TASK_DIRECTORY_ERROR,
  REQUEST_TASK_DIRECTORY_SUCCESS
} from '../constants/ActionTypes';
import {
  SERVER_ACTION
} from '../../../../../src/js/constants/ActionTypes';
import {
  TASK_DIRECTORY_CHANGE,
  TASK_DIRECTORY_ERROR
} from '../constants/EventTypes';
import AppDispatcher from '../../../../../src/js/events/AppDispatcher';
import Config from '../../../../../src/js/config/Config';
import GetSetBaseStore from '../../../../../src/js/stores/GetSetBaseStore';
import MesosStateStore from '../../../../../src/js/stores/MesosStateStore';
import TaskDirectory from '../structs/TaskDirectory';
import TaskDirectoryActions from '../events/TaskDirectoryActions';

var requestInterval = null;
var activeXHR = null;

function fetchState(task, innerPath) {
  let node = MesosStateStore.getNodeFromID(task.slave_id);
  activeXHR = TaskDirectoryActions.fetchNodeState(
    task,
    node,
    function (response) {
      activeXHR = TaskDirectoryActions
        .fetchDirectory(task, innerPath, response);
    }
  );
}

function startPolling(task, innerPath) {
  if (requestInterval == null) {
    fetchState(task, innerPath);

    requestInterval = setInterval(
      fetchState.bind(this, task, innerPath), Config.getRefreshRate()
    );
  }
}

class TaskDirectoryStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      directory: null,
      innerPath: ''
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: TASK_DIRECTORY_CHANGE,
        error: TASK_DIRECTORY_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      let {data, innerPath, taskID, type} = payload.action;
      switch (type) {
        case REQUEST_TASK_DIRECTORY_SUCCESS:
          this.processStateSuccess(data, innerPath, taskID);
          break;
        case REQUEST_TASK_DIRECTORY_ERROR:
          this.processStateError(taskID);
          break;
      }

      return true;
    });

  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);

    if (this.listeners(TASK_DIRECTORY_CHANGE).length === 0) {
      this.resetRequests();
      this.set({innerPath: '', directory: null});
    }
  }

  resetRequests() {
    if (requestInterval != null) {
      clearInterval(requestInterval);
      requestInterval = null;
    }

    if (activeXHR != null) {
      activeXHR.abort();
      activeXHR = null;
    }
  }

  // Default innerPath to empty string so it matches with default innerPath
  fetchDirectory(task, innerPath = '') {
    this.resetRequests();
    this.set({directory: null});
    // Make sure to update innerPath if different before fetching
    if (this.get('innerPath') !== innerPath) {
      this.set({innerPath});
    }

    this.emit(TASK_DIRECTORY_CHANGE, task.id);
    startPolling(task, innerPath);
  }

  addPath(task, path) {
    this.set({innerPath: this.get('innerPath') + '/' + path});
    this.fetchDirectory(task, this.get('innerPath'));
  }

  setPath(task, path) {
    this.set({innerPath: path});
    this.fetchDirectory(task, path);
  }

  processStateError(taskID) {
    this.emit(TASK_DIRECTORY_ERROR, taskID);
  }

  processStateSuccess(items, innerPath, taskID) {
    // Only update when receiving response from what was requested
    if (this.get('innerPath') === innerPath) {
      this.set({directory: new TaskDirectory({items})});
      this.emit(TASK_DIRECTORY_CHANGE, taskID);
    }
  }

  get storeID() {
    return 'taskDirectory';
  }

}

module.exports = new TaskDirectoryStore();
