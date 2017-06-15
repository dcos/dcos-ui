import PluginSDK from "PluginSDK";
import {
  REQUEST_NODE_STATE_ERROR,
  REQUEST_NODE_STATE_SUCCESS,
  REQUEST_TASK_DIRECTORY_ERROR,
  REQUEST_TASK_DIRECTORY_SUCCESS
} from "../constants/ActionTypes";
import { SERVER_ACTION } from "../../../../../src/js/constants/ActionTypes";
import {
  NODE_STATE_ERROR,
  NODE_STATE_SUCCESS,
  TASK_DIRECTORY_CHANGE,
  TASK_DIRECTORY_ERROR
} from "../constants/EventTypes";
import AppDispatcher from "../../../../../src/js/events/AppDispatcher";
import Config from "../../../../../src/js/config/Config";
import GetSetBaseStore from "../../../../../src/js/stores/GetSetBaseStore";
import MesosStateStore from "../../../../../src/js/stores/MesosStateStore";
import TaskDirectory from "../structs/TaskDirectory";
import TaskDirectoryActions from "../events/TaskDirectoryActions";

var requestInterval = null;
var activeXHR = null;

function fetchState(task, innerPath) {
  const node = MesosStateStore.getNodeFromID(task.slave_id);
  activeXHR = TaskDirectoryActions.fetchNodeState(task, node, innerPath);
}

function startPolling(task, innerPath) {
  if (requestInterval == null) {
    fetchState(task, innerPath);

    requestInterval = setInterval(
      fetchState.bind(this, task, innerPath),
      Config.getRefreshRate()
    );
  }
}

class TaskDirectoryStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      directory: null,
      innerPath: ""
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        error: TASK_DIRECTORY_ERROR,
        success: TASK_DIRECTORY_CHANGE,
        nodeStateError: REQUEST_NODE_STATE_ERROR,
        nodeStateSuccess: REQUEST_NODE_STATE_SUCCESS
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      const { data, innerPath, task, type } = payload.action;
      switch (type) {
        case REQUEST_TASK_DIRECTORY_SUCCESS:
          this.processStateSuccess(data, innerPath, task.id);
          break;
        case REQUEST_TASK_DIRECTORY_ERROR:
          this.emit(TASK_DIRECTORY_ERROR, task.id);
          break;
        case REQUEST_NODE_STATE_ERROR:
          this.emit(NODE_STATE_ERROR, task.id);
          break;
        case REQUEST_NODE_STATE_SUCCESS:
          activeXHR = TaskDirectoryActions.fetchDirectory(
            task,
            innerPath,
            data
          );
          this.emit(NODE_STATE_SUCCESS, task.id);
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
      this.set({ innerPath: "", directory: null });
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
  fetchDirectory(task, innerPath = "") {
    this.resetRequests();
    this.set({ directory: null });
    // Make sure to update innerPath if different before fetching
    if (this.get("innerPath") !== innerPath) {
      this.set({ innerPath });
    }

    this.emit(TASK_DIRECTORY_CHANGE, task.id);
    startPolling(task, innerPath);
  }

  addPath(task, path) {
    this.set({ innerPath: this.get("innerPath") + "/" + path });
    this.fetchDirectory(task, this.get("innerPath"));
  }

  setPath(task, path) {
    this.set({ innerPath: path });
    this.fetchDirectory(task, path);
  }

  processStateSuccess(items, innerPath, taskID) {
    // Only update when receiving response from what was requested
    if (this.get("innerPath") === innerPath) {
      this.set({ directory: new TaskDirectory({ items }) });
      this.emit(TASK_DIRECTORY_CHANGE, taskID);
    }
  }

  get storeID() {
    return "taskDirectory";
  }
}

module.exports = new TaskDirectoryStore();
