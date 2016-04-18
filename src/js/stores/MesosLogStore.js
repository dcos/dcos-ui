import {Store} from 'mesosphere-shared-reactjs';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import Config from '../config/Config';
import EventTypes from '../constants/EventTypes';
import GetSetMixin from '../mixins/GetSetMixin';
import Item from '../structs/Item';
import LogBuffer from '../structs/LogBuffer';
import MesosLogActions from '../events/MesosLogActions';

const MAX_FILE_SIZE = 50000;

const MesosLogStore = Store.createStore({
  storeID: 'mesosLog',

  mixins: [GetSetMixin],

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  getPreviousLogs: function (slaveID, path) {
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
  },

  startTailing: function (slaveID, path) {
    let logBuffer = new LogBuffer();
    this.set({[path]: logBuffer});
    // Request offset to initialize logBuffer
    MesosLogActions.requestOffset(slaveID, path);
  },

  stopTailing: function (path) {
    // As soon as any request responds (success or error) the tailing will stop
    this.set({[path]: undefined});
  },

  processOffset: function (slaveID, path, entry) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }
    logBuffer.initialize(entry.offset);
    // Start tailing
    MesosLogActions
      .fetchLog(slaveID, path, logBuffer.getEnd(), MAX_FILE_SIZE);

    this.emit(EventTypes.MESOS_INITIALIZE_LOG_CHANGE, path);
  },

  processOffsetError: function (slaveID, path) {
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

    this.emit(EventTypes.MESOS_INITIALIZE_LOG_REQUEST_ERROR, path);
  },

  processLogEntry: function (slaveID, path, entry) {
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
    this.emit(EventTypes.MESOS_LOG_CHANGE, path, 'append');

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
  },

  processLogPrepend: function (slaveID, path, entry) {
    let logBuffer = this.get(path);
    if (!logBuffer) {
      // Stop tailing immediately if listener decided to call stopTailing
      return;
    }

    let data = entry.data;
    if (data.length > 0) {
      logBuffer.prepend(new Item(entry));
    }

    this.emit(EventTypes.MESOS_LOG_CHANGE, path, 'prepend');
  },

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

    this.emit(EventTypes.MESOS_LOG_REQUEST_ERROR, path);
  },

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

    this.emit(EventTypes.MESOS_LOG_REQUEST_ERROR, path);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    let source = payload.source;
    if (source !== ActionTypes.SERVER_ACTION) {
      return false;
    }

    let action = payload.action;

    switch (action.type) {
      case ActionTypes.REQUEST_MESOS_LOG_SUCCESS:
        MesosLogStore.processLogEntry(action.slaveID, action.path, action.data);
        break;
      case ActionTypes.REQUEST_MESOS_LOG_ERROR:
        MesosLogStore.processLogError(action.slaveID, action.path);
        break;
      case ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_SUCCESS:
        MesosLogStore.processLogPrepend(action.slaveID, action.path, action.data);
        break;
      case ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_ERROR:
        MesosLogStore.processLogPrependError(action.slaveID, action.path);
        break;
      case ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS:
        MesosLogStore.processOffset(action.slaveID, action.path, action.data);
        break;
      case ActionTypes.REQUEST_MESOS_LOG_OFFSET_ERROR:
        MesosLogStore.processOffsetError(action.slaveID, action.path);
        break;
    }

    return true;
  })

});

module.exports = MesosLogStore;
