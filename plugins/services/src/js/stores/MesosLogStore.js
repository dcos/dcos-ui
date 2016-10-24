import PluginSDK from 'PluginSDK';

import {
  REQUEST_MESOS_LOG_ERROR,
  REQUEST_MESOS_LOG_OFFSET_ERROR,
  REQUEST_MESOS_LOG_OFFSET_SUCCESS,
  REQUEST_MESOS_LOG_SUCCESS,
  REQUEST_PREVIOUS_MESOS_LOG_ERROR,
  REQUEST_PREVIOUS_MESOS_LOG_SUCCESS
} from '../constants/ActionTypes';
import {
  SERVER_ACTION
} from '../../../../../src/js/constants/ActionTypes';
import AppDispatcher from '../../../../../src/js/events/AppDispatcher';
import Config from '../../../../../src/js/config/Config';
import {
  MESOS_INITIALIZE_LOG_CHANGE,
  MESOS_INITIALIZE_LOG_REQUEST_ERROR,
  MESOS_LOG_CHANGE,
  MESOS_LOG_REQUEST_ERROR
} from '../constants/EventTypes';
import GetSetBaseStore from '../../../../../src/js/stores/GetSetBaseStore';
import Item from '../../../../../src/js/structs/Item';
import LogBuffer from '../structs/LogBuffer';
import MesosLogActions from '../events/MesosLogActions';

const MAX_FILE_SIZE = 50000;

class MesosLogStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: MESOS_LOG_CHANGE,
        error: MESOS_LOG_REQUEST_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true,
      suppressUpdate: true
    });

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      let source = payload.source;
      if (source !== SERVER_ACTION) {
        return false;
      }

      let action = payload.action;

      switch (action.type) {
        case REQUEST_MESOS_LOG_SUCCESS:
          this.processLogEntry(action.slaveID, action.path, action.data);
          break;
        case REQUEST_MESOS_LOG_ERROR:
          this.processLogError(action.slaveID, action.path);
          break;
        case REQUEST_PREVIOUS_MESOS_LOG_SUCCESS:
          this.processLogPrepend(action.slaveID, action.path, action.data);
          break;
        case REQUEST_PREVIOUS_MESOS_LOG_ERROR:
          this.processLogPrependError(action.slaveID, action.path);
          break;
        case REQUEST_MESOS_LOG_OFFSET_SUCCESS:
          this.processOffset(action.slaveID, action.path, action.data);
          break;
        case REQUEST_MESOS_LOG_OFFSET_ERROR:
          this.processOffsetError(action.slaveID, action.path);
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
  }

  getPreviousLogs(slaveID, path) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }

    let startOffset = logBuffer.getStart() - MAX_FILE_SIZE;
    if (startOffset < 0) {
      startOffset = 0;
    }

    if (startOffset === 0 && logBuffer.getStart() === 0) {
      // Already at the top.
      return;
    }

    MesosLogActions.fetchPreviousLog(
      slaveID, path, startOffset, MAX_FILE_SIZE
    );
  }

  startTailing(slaveID, path) {
    let logBuffer = new LogBuffer();
    this.set({[path]: logBuffer});
    // Request offset to initialize logBuffer
    MesosLogActions.requestOffset(slaveID, path);
  }

  stopTailing(path) {
    // As soon as any request responds (success or error) the tailing will stop
    this.set({[path]: undefined});
  }

  processOffset(slaveID, path, entry) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }
    logBuffer.initialize(entry.offset);
    // Start tailing
    MesosLogActions
      .fetchLog(slaveID, path, logBuffer.getEnd(), MAX_FILE_SIZE);

    this.emit(MESOS_INITIALIZE_LOG_CHANGE, path);
  }

  processOffsetError(slaveID, path) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      // even if the initial offset request fails
      return;
    }

    // Try to re-initialize from where we left off
    setTimeout(function () {
      MesosLogActions.requestOffset(slaveID, path);
    }, Config.tailRefresh);

    this.emit(MESOS_INITIALIZE_LOG_REQUEST_ERROR, path);
  }

  processLogEntry(slaveID, path, entry) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }

    let data = entry.data;
    if (data.length > 0) {
      logBuffer.add(new Item(entry));
    }

    // Fire event always, so listener knows that we have received data
    // This way it is easier to tell whether we are for data or it was empty
    this.emit(MESOS_LOG_CHANGE, path, 'append');

    let end = logBuffer.getEnd();
    if (data.length === MAX_FILE_SIZE) {
      // Tail immediately if we received as much data as requested,
      // since that might mean that there is more data to show
      MesosLogActions.fetchLog(slaveID, path, end, MAX_FILE_SIZE);
    } else {
      setTimeout(function () {
        MesosLogActions.fetchLog(slaveID, path, end, MAX_FILE_SIZE);
      }, Config.tailRefresh);
    }
  }

  processLogPrepend(slaveID, path, entry) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }

    let data = entry.data;
    if (data.length > 0) {
      logBuffer.prepend(new Item(entry));
    }

    this.emit(MESOS_LOG_CHANGE, path, 'prepend');
  }

  processLogError(slaveID, path) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }

    // Try to re-start from where we left off
    setTimeout(function () {
      MesosLogActions
        .fetchLog(slaveID, path, logBuffer.getEnd(), MAX_FILE_SIZE);
    }, Config.tailRefresh);

    this.emit(MESOS_LOG_REQUEST_ERROR, path);
  }

  processLogPrependError(slaveID, path) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }

    // Try request again immediately.
    MesosLogActions.fetchLog(
      slaveID, path, logBuffer.getStart() - MAX_FILE_SIZE, MAX_FILE_SIZE
    );

    this.emit(MESOS_LOG_REQUEST_ERROR, path);
  }

  get storeID() {
    return 'mesosLog';
  }

}

module.exports = new MesosLogStore();
