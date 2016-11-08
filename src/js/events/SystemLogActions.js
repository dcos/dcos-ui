import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_SYSTEM_LOG_SUCCESS,
  REQUEST_SYSTEM_LOG_ERROR,
  REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
  REQUEST_PREVIOUS_SYSTEM_LOG_ERROR
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import SystemLogUtil from '../utils/SystemLogUtil';

/**
 * Implementation of server sent event handling for
 * https://github.com/dcos/dcos-log
 */

// Store of current open connections
let sources = {};
const SystemLogActions = {
  subscribe(nodeID, options = {}) {
    let {
      subscriptionID,
      withCredentials = true
    } = options;

    let url = SystemLogUtil.getUrl(nodeID, options);
    subscriptionID = subscriptionID || global.btoa(url);
    // TODO: check user for credentials?
    let source = new EventSource(url, {withCredentials});

    source.addEventListener('message', function ({data, origin, target} = {}) {
      if (origin !== global.location.origin && target.readyState !== EventSource.OPEN) {
        // Event is not from same origin, or is not open anymore
        return false;
      }
      let parsedData = JSON.parse(data);
      AppDispatcher.handleServerAction({
        type: REQUEST_SYSTEM_LOG_SUCCESS,
        data: parsedData,
        subscriptionID
      });
    }, false);

    source.addEventListener('error', (event = {}) => {
      let {target} = event;
      let {cursor} = sources[subscriptionID];
      AppDispatcher.handleServerAction({
        type: REQUEST_SYSTEM_LOG_ERROR,
        data: RequestUtil.getErrorFromXHR(event),
        subscriptionID
      });
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
  },

  fetchLogRange(nodeID, options = {}) {
    let {
      limit = 0,
      subscriptionID,
      withCredentials = true
    } = options;

    let url = SystemLogUtil.getUrl(nodeID, options, false);
    subscriptionID = subscriptionID || global.btoa(url);
    // TODO: check user for credentials?
    let source = new EventSource(url, {withCredentials});

    let items = [];

    source.addEventListener('message', function ({data, origin, target} = {}) {
      if (origin !== global.location.origin) {
        // Event is not from same origin, or is not open anymore
        return false;
      }
      if (target.readyState === EventSource.CLOSED) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
          data: items,
          limit,
          subscriptionID
        });

        source.close();
      }

      let parsedData = JSON.parse(data);
      items.push(parsedData);
    }, false);

    source.addEventListener('error', (event = {}) => {
      source.close();
      AppDispatcher.handleServerAction({
        type: REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
        data: RequestUtil.getErrorFromXHR(event),
        subscriptionID
      });
    });
  }
};

module.exports = SystemLogActions;
