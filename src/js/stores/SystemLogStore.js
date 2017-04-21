import PluginSDK from "PluginSDK";

import {
  REQUEST_SYSTEM_LOG_ERROR,
  REQUEST_SYSTEM_LOG_SUCCESS,
  REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
  REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
  REQUEST_SYSTEM_LOG_STREAM_TYPES_ERROR,
  REQUEST_SYSTEM_LOG_STREAM_TYPES_SUCCESS,
  SERVER_ACTION
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import {
  SYSTEM_LOG_CHANGE,
  SYSTEM_LOG_REQUEST_ERROR,
  SYSTEM_LOG_STREAM_TYPES_SUCCESS,
  SYSTEM_LOG_STREAM_TYPES_ERROR
} from "../constants/EventTypes";
import BaseStore from "./BaseStore";
import Config from "../config/Config";
import SystemLogActions from "../events/SystemLogActions";
import { APPEND, PREPEND } from "../constants/SystemLogTypes";
import { findNestedPropertyInObject } from "../utils/Util";
import { MESSAGE } from "../constants/LogFields";
import { msToLogTime } from "../utils/DateUtil";

class SystemLogStore extends BaseStore {
  constructor() {
    super(...arguments);

    this.logs = {};

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: SYSTEM_LOG_CHANGE,
        error: SYSTEM_LOG_REQUEST_ERROR,
        streamSuccess: SYSTEM_LOG_STREAM_TYPES_SUCCESS,
        streamError: SYSTEM_LOG_STREAM_TYPES_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true,
      suppressUpdate: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      const source = payload.source;
      if (source !== SERVER_ACTION) {
        return false;
      }

      const { data, firstEntry, subscriptionID, type } = payload.action;

      switch (type) {
        case REQUEST_SYSTEM_LOG_SUCCESS:
          this.processLogAppend(subscriptionID, data);
          break;
        case REQUEST_SYSTEM_LOG_ERROR:
          this.processLogError(subscriptionID, data);
          break;
        case REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS:
          this.processLogPrepend(subscriptionID, firstEntry, data);
          break;
        case REQUEST_PREVIOUS_SYSTEM_LOG_ERROR:
          this.processLogPrependError(subscriptionID, data);
          break;
        case REQUEST_SYSTEM_LOG_STREAM_TYPES_SUCCESS:
          this.emit(SYSTEM_LOG_STREAM_TYPES_SUCCESS, data);
          break;
        case REQUEST_SYSTEM_LOG_STREAM_TYPES_ERROR:
          this.emit(SYSTEM_LOG_STREAM_TYPES_ERROR, data);
          break;
      }

      return true;
    });
  }

  addEntries(logData, entries, eventType) {
    const newLogData = Object.assign({}, logData);
    // Add new entries
    if (eventType === APPEND) {
      newLogData.entries = logData.entries.concat(entries);
    } else {
      newLogData.entries = entries.concat(logData.entries);
    }
    const length = entries.reduce((sum, entry) => {
      return (
        sum + findNestedPropertyInObject(entry, `fields.${MESSAGE}.length`) || 0
      );
    }, 0);

    // Update new size
    newLogData.totalSize += length;

    return newLogData;
  }

  getFullLog(subscriptionID) {
    const entries = findNestedPropertyInObject(
      this.logs[subscriptionID],
      "entries"
    ) || [];

    // Formatting logs as we do in the CLI:
    // https://github.com/dcos/dcos-cli/pull/817/files#diff-8f3b06e62cf338c8e4e2ac6414447d26R260
    return entries
      .filter(entry => {
        return Boolean(findNestedPropertyInObject(entry, `fields.${MESSAGE}`));
      })
      .map(function(entry) {
        const { fields = {} } = entry;
        const lineData = [];
        // entry.realtime_timestamp returns a unix time in microseconds
        // https://www.freedesktop.org/software/systemd/man/sd_journal_get_realtime_usec.html
        if (typeof entry.realtime_timestamp === "number") {
          lineData.push(msToLogTime(entry.realtime_timestamp / 1000));
        }
        // Concat `:` to last element if there is data
        if (lineData.length) {
          const lastElement = lineData[lineData.length - 1];
          lineData[lineData.length - 1] = `${lastElement}:`;
        }

        lineData.push(fields[MESSAGE]);

        // Format: `date: MESSAGE`
        return `${lineData.join(" ")}`;
      })
      .join("\n");
  }

  hasLoadedTop(subscriptionID) {
    const logs = this.logs[subscriptionID];
    if (!logs || !logs.hasLoadedTop) {
      return false;
    }

    return logs.hasLoadedTop;
  }

  startTailing(nodeID, options) {
    let { subscriptionID, cursor } = options;
    if (!cursor && subscriptionID && this.logs[subscriptionID]) {
      const { entries } = this.logs[subscriptionID];
      cursor = entries[entries.length - 1].cursor;
      options = Object.assign({}, options, { cursor });
    }

    // Will return unchanged subscriptionID if provided in the options
    subscriptionID = SystemLogActions.startTail(nodeID, options);

    // Start a timer to notify view if we have received nothing
    // within reasonable time
    setTimeout(() => {
      if (subscriptionID && !this.logs[subscriptionID]) {
        // Send event that we have not received anything. However,
        // keep connection open, if we receive data later, we want to show it.
        this.emit(SYSTEM_LOG_CHANGE, subscriptionID, APPEND);
      }
      // Let's wait 2 x stateRefresh ~ 2 errors,
      // as we do in other views
    }, Config.stateRefresh * 2);

    // Return received subscriptionID
    return subscriptionID;
  }

  stopTailing(subscriptionID, shouldClearData = false) {
    if (shouldClearData) {
      delete this.logs[subscriptionID];
    }

    SystemLogActions.stopTail(subscriptionID);
  }

  fetchRange(nodeID, options) {
    const { subscriptionID } = options;
    const cursor = findNestedPropertyInObject(
      this.logs[subscriptionID],
      "entries.0.cursor"
    );
    if ((!cursor && !options.cursor) || this.hasLoadedTop(subscriptionID)) {
      return false;
    }

    SystemLogActions.fetchRange(nodeID, Object.assign({ cursor }, options));
  }

  fetchStreamTypes(nodeID) {
    SystemLogActions.fetchStreamTypes(nodeID);
  }

  processLogAppend(subscriptionID, entries) {
    if (!this.logs[subscriptionID]) {
      this.logs[subscriptionID] = { entries: [], totalSize: 0 };
    }

    this.logs[subscriptionID] = this.addEntries(
      this.logs[subscriptionID],
      entries,
      APPEND
    );
    this.emit(SYSTEM_LOG_CHANGE, subscriptionID, APPEND);
  }

  processLogError(subscriptionID, data) {
    if (!this.logs[subscriptionID]) {
      this.logs[subscriptionID] = { entries: [], totalSize: 0 };
    }
    this.emit(SYSTEM_LOG_REQUEST_ERROR, subscriptionID, APPEND, data);
  }

  processLogPrepend(subscriptionID, firstEntry, entries = []) {
    if (!this.logs[subscriptionID]) {
      this.logs[subscriptionID] = { entries: [], totalSize: 0 };
    }

    this.logs[subscriptionID].hasLoadedTop = firstEntry;

    this.logs[subscriptionID] = this.addEntries(
      this.logs[subscriptionID],
      entries,
      PREPEND
    );

    this.emit(SYSTEM_LOG_CHANGE, subscriptionID, PREPEND);
  }

  processLogPrependError(subscriptionID, data) {
    if (!this.logs[subscriptionID]) {
      this.logs[subscriptionID] = { entries: [], totalSize: 0 };
    }
    this.emit(SYSTEM_LOG_REQUEST_ERROR, subscriptionID, PREPEND, data);
  }

  get storeID() {
    return "systemLog";
  }
}

module.exports = new SystemLogStore();
