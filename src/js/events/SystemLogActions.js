import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';

let sources = {};
const SystemLogActions = {
  subscribe(nodeID, options = {}) {
    let {
      cursor = '',
      error,
      limit = '',
      params = {},
      skip = 0, // Use stream when skip is 0
      subscriptionID,
      success
    } = options;

    let endpoint = 'logs';
    if (skip === 0) {
      endpoint = 'stream';
    }
    let paramString = Object.keys(params).reduce(function (memo, key) {
      return memo + `&${key}=${params[key]}`;
    }, '');

    let encodedRange = global.btoa(`entries=${cursor}:${limit}:${skip}`);
    let timestamp = Date.now();
    let url = `system/logs/v1/agent/${nodeID}/${endpoint}?__range=${encodedRange}${paramString}&timestamp=${timestamp}`;
    subscriptionID = subscriptionID || global.btoa(url);
    let source = new EventSource(url, {withCredentials: true});

    source.addEventListener('message', function ({data, origin, target} = {}) {
      if (origin !== global.location.origin && target.readyState !== EventSource.OPEN) {
        // Event is not from same origin, or is not open anymore
        return false;
      }
      let parsedData = JSON.parse(data);
      // Update cursor to latest received
      if (parsedData.cursor) {
        sources[subscriptionID].cursor = parsedData.cursor;
      }
      if (typeof success === 'function') {
        success(parsedData);
      }
    }, false);

    source.addEventListener('error', (event = {}) => {
      let {target} = event;

      let nextCursor = sources[subscriptionID].cursor;
      // Only reconnect if we have received a point to continue logging from
      if (nextCursor) {
        // Close current connection
        this.unsubscribe(subscriptionID);
        // Wait and reopen connection where we left off
        setTimeout(() => {
          let newOptions = Object.assign({}, options, {
            cursor: nextCursor, // Continue logging from where we left off
            limit: 0, // Start exactly at this point
            subscriptionID // Reuse subscriptionID
          });
          this.subscribe(nodeID, newOptions);
          // Use retry received from server as timeout, or fallback to 3 secs.
          // This mimics standard behavior for reconnecting
        }, target.retry || 3000);
      }
      if (typeof error === 'function') {
        error(event);
      }
    }, false);

    // Unsubscribe if any open connection exists with the same ID
    this.unsubscribe(subscriptionID);
    sources[subscriptionID] = {source};

    return subscriptionID;
  },

  unsubscribe(subscriptionID) {
    if (sources[subscriptionID]) {
      sources[subscriptionID].source.close();
      delete sources[subscriptionID];
    }
  }
};

module.exports = SystemLogActions;
