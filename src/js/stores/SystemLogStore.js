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
import SystemLogActions from '../events/SystemLogActions';
import Util from '../utils/Util';

// Max data storage
const MAX_FILE_SIZE = 250000000;

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

      let {data, hasReachedTop, subscriptionID, type} = payload.action;

      switch (type) {
        case REQUEST_SYSTEM_LOG_SUCCESS:
          this.processLogEntry(subscriptionID, data);
          break;
        case REQUEST_SYSTEM_LOG_ERROR:
          this.processLogError(subscriptionID, data);
          break;
        case REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS:
          this.processLogPrepend(subscriptionID, hasReachedTop, data);
          break;
        case REQUEST_PREVIOUS_SYSTEM_LOG_ERROR:
          this.processLogPrependError(subscriptionID, data);
          break;
      }

      return true;
    });
  }

  addEntries(logData, subscriptionID, entries, eventType) {
    let newLogData = Object.assign({}, logData);
    // Add new entries
    if (eventType === 'append') {
      newLogData.entries = logData.entries.concat(entries);
    } else {
      newLogData.entries = entries.concat(logData.entries);
    }
    let length = entries.reduce((sum, entry) => {
      return sum + Util.findNestedPropertyInObject(
        entry,
        'fields.MESSAGE.length'
      ) || 0;
    }, 0);

    // Update new size
    newLogData.totalSize += length;
    // Remove entires until we have room for next entry
    while (newLogData.totalSize > 0 && newLogData.entries.length > 0 &&
      newLogData.totalSize > MAX_FILE_SIZE) {
      let removedEntry;
      if (eventType === 'append') {
        removedEntry = newLogData.entries.shift();
        // Removing from top, let's update hasLoadedTop
        newLogData.hasLoadedTop = false;
      } else {
        removedEntry = newLogData.entries.pop();
      }
      newLogData.totalSize -= Util.findNestedPropertyInObject(
        removedEntry,
        'fields.MESSAGE.length'
      ) || 0;
    }

    return newLogData;
  }

  getFullLog(subscriptionID) {
    let entries = Util.findNestedPropertyInObject(
      this.logs[subscriptionID],
      'entries'
    ) || [];

    return entries.map(function (entry) {
      return Util.findNestedPropertyInObject(entry, 'fields.MESSAGE') || '';
    }).join('\n');
  }

  hasLoadedTop(subscriptionID) {
    let logs = this.logs[subscriptionID];
    if (!logs || !logs.hasLoadedTop) {
      return false;
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

    this.logs[subscriptionID] = this.addEntries(
      this.logs[subscriptionID],
      subscriptionID,
      [entry],
      'append'
    );
    this.emit(SYSTEM_LOG_CHANGE, subscriptionID, 'append');
  }

  processLogError(subscriptionID, data) {
    this.emit(SYSTEM_LOG_REQUEST_ERROR, subscriptionID, data);
  }

  processLogPrepend(subscriptionID, hasReachedTop, entries = []) {
    if (!this.logs[subscriptionID]) {
      this.logs[subscriptionID] = {entries: [], totalSize: 0};
    }

    this.logs[subscriptionID].hasLoadedTop = hasReachedTop;

    this.logs[subscriptionID] = this.addEntries(
      this.logs[subscriptionID],
      subscriptionID,
      entries,
      'prepend'
    );

    this.emit(SYSTEM_LOG_CHANGE, subscriptionID, 'prepend');
  }

  processLogPrependError(subscriptionID, data) {
    this.emit(SYSTEM_LOG_REQUEST_ERROR, subscriptionID, data);
  }

  get storeID() {
    return 'systemLog';
  }
}

module.exports = new SystemLogStore();
