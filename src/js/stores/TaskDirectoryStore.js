import GetSetBaseStore from './GetSetBaseStore';
import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import Config from '../config/Config';
import EventTypes from '../constants/EventTypes';
import TaskDirectory from '../structs/TaskDirectory';
import TaskDirectoryActions from '../events/TaskDirectoryActions';

var requestInterval = null;
var activeXHR = null;

function fetchState(task, deeperPath) {
  activeXHR = TaskDirectoryActions.fetchNodeState(task, function (response) {
    activeXHR = TaskDirectoryActions
      .fetchDirectory(task, deeperPath, response);
  });
}

function startPolling(task, deeperPath) {
  if (requestInterval == null) {
    fetchState(task, deeperPath);

    requestInterval = setInterval(
      fetchState.bind(this, task, deeperPath), Config.getRefreshRate()
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

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== ActionTypes.SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case ActionTypes.REQUEST_TASK_DIRECTORY_SUCCESS:
          this.processStateSuccess(action.data, action.sandBoxPath);
          break;
        case ActionTypes.REQUEST_TASK_DIRECTORY_ERROR:
          this.processStateError();
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

    if (this.listeners(EventTypes.TASK_DIRECTORY_CHANGE).length === 0) {
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

  getDirectory(task, deeperPath) {
    this.resetRequests();
    this.set({directory: null});
    this.emit(EventTypes.TASK_DIRECTORY_CHANGE);

    startPolling(task, deeperPath);
  }

  addPath(task, path) {
    this.set({innerPath: this.get('innerPath') + '/' + path});
    this.getDirectory(task, this.get('innerPath'));
  }

  setPath(task, path) {
    this.set({innerPath: path});
    this.getDirectory(task, path);
  }

  processStateError() {
    this.emit(EventTypes.TASK_DIRECTORY_ERROR);
  }

  processStateSuccess(directory, sandBoxPath) {
    this.set({directory: new TaskDirectory({items: directory}), sandBoxPath});
    this.emit(EventTypes.TASK_DIRECTORY_CHANGE);
  }

  get storeID() {
    return 'taskDirectory';
  }

}

module.exports = new TaskDirectoryStore();
