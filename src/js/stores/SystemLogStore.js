import PluginSDK from 'PluginSDK';

import {
  REQUEST_SYSTEM_LOG_ERROR,
  REQUEST_SYSTEM_LOG_SUCCESS,
  REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
  REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
  SERVER_ACTION
} from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import {
  SYSTEM_LOG_CHANGE,
  SYSTEM_LOG_REQUEST_ERROR
} from '../constants/EventTypes';
import BaseStore from './BaseStore';
// import LogBuffer from '../structs/LogBuffer';
import SystemLogActions from '../events/SystemLogActions';
import Util from '../utils/Util';

// Max data storage / message size
// 250000000/2500 = 100000;
const MAX_FILE_SIZE = 100000;

class SystemLogStore extends BaseStore {
  constructor() {
    super(...arguments);

    this.logs = {};

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: SYSTEM_LOG_CHANGE,
        error: SYSTEM_LOG_REQUEST_ERROR
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

      let {data, limit, subscriptionID, type} = payload.action;

      switch (type) {
        case REQUEST_SYSTEM_LOG_SUCCESS:
          this.processLogEntry(subscriptionID, data);
          break;
        case REQUEST_SYSTEM_LOG_ERROR:
          this.processLogError(subscriptionID, data);
          break;
        case REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS:
          this.processLogPrepend(subscriptionID, limit, data);
          break;
        case REQUEST_PREVIOUS_SYSTEM_LOG_ERROR:
          this.processLogPrependError(subscriptionID, data);
          break;
      }

      return true;
    });
  }

  addEntry(logData, subscriptionID, entry, eventType) {
    let newLogData = Object.assign({}, logData);
    let length = Util.findNestedPropertyInObject(
      entry,
      'fields.MESSAGE.length'
    ) || 0;
    // Remove entires until we have room for next entry
    while (newLogData.totalSize > 0 && newLogData.entries.length > 0 &&
      newLogData.totalSize + length > MAX_FILE_SIZE) {
      let removedEntry;
      if (eventType === 'append') {
        removedEntry = newLogData.entries.shift();
      } else {
        removedEntry = newLogData.entries.pop();
      }
      newLogData.totalSize -= Util.findNestedPropertyInObject(
        removedEntry,
        'fields.MESSAGE.length'
      ) || 0;
    }
    // Space have been freed up, let's add the new entry and update totalSize
    let removedEntry;
    if (eventType === 'append') {
      newLogData.entries.push(entry);
    } else {
      newLogData.entries.unshift(entry);
    }
    newLogData.totalSize += length;

    return newLogData;
  }

  getFullLog(subscriptionID) {
    let entries = Util.findNestedPropertyInObject(
      this.logs[subscriptionID],
      'entries'
    ) || [];
    console.log('getFullLog', entries.length);
    return entries.map(function (entry) {
      return Util.findNestedPropertyInObject(entry, 'fields.MESSAGE') || '';
    }).join('\n');
  }

  hasLoadedTop(subscriptionID) {
    let logs = this.logs[subscriptionID];
    if (!logs || !logs.hasLoadedTop) {
      return false
    }

    return logs.hasLoadedTop;
  }

  startTailing(nodeID, options) {
    // Return received subscriptionID
    return SystemLogActions.subscribe(nodeID, options);
  }

  stopTailing(subscriptionID) {
    SystemLogActions.unsubscribe(subscriptionID);
  }

  fetchLogRange(nodeID, options) {
    let {subscriptionID} = options;
    let cursor = Util.findNestedPropertyInObject(
      this.logs[subscriptionID],
      'entries.0.cursor'
    );
    if (!cursor || this.hasLoadedTop(subscriptionID)) {
      return false;
    }
    SystemLogActions.fetchLogRange(
      nodeID,
      Object.assign({cursor}, options)
    );
  }

  processLogEntry(subscriptionID, entry = {}) {
    if (!this.logs[subscriptionID]) {
      this.logs[subscriptionID] = {entries: [], totalSize: 0};
    }
    this.logs[subscriptionID] = this.addEntry(
      this.logs[subscriptionID],
      subscriptionID,
      entry,
      'append'
    );
    this.emit(SYSTEM_LOG_CHANGE, subscriptionID);
  }

  processLogError(subscriptionID, data) {
    this.emit(SYSTEM_LOG_REQUEST_ERROR, subscriptionID, data);
  }

  processLogPrepend(subscriptionID, limit, entries = []) {
    if (!this.logs[subscriptionID]) {
      this.logs[subscriptionID] = {entries: [], totalSize: 0};
    }

    this.logs[subscriptionID].hasLoadedTop = limit > 0 && limit < entries;

    entries.forEach(function (entry = {}) {
      this.logs[subscriptionID] = this.addEntry(
        this.logs[subscriptionID],
        subscriptionID,
        entry,
        'prepend'
      );
    })

    this.emit(SYSTEM_LOG_CHANGE, subscriptionID);
  }

  processLogPrependError(subscriptionID, data) {
    this.emit(SYSTEM_LOG_REQUEST_ERROR, subscriptionID, data);
  }


  get storeID() {
    return 'systemLog';
  }
}

module.exports = new SystemLogStore();
