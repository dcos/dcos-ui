import {
  REQUEST_SYSTEM_LOG_SUCCESS,
  REQUEST_SYSTEM_LOG_ERROR,
  REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
  REQUEST_PREVIOUS_SYSTEM_LOG_ERROR
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import CookieUtils from '../utils/CookieUtils';
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
      subscriptionID
    } = options;

    let url = SystemLogUtil.getUrl(nodeID, options);
    subscriptionID = subscriptionID || global.btoa(url);
    let source = new EventSource(url, {
      withCredentials: Boolean(CookieUtils.getUserMetadata())
    });

    source.addEventListener('message', function ({data, origin, eventPhase} = {}) {
      if (origin !== global.location.origin && eventPhase !== EventSource.OPEN) {
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
      AppDispatcher.handleServerAction({
        type: REQUEST_SYSTEM_LOG_ERROR,
        data: event,
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
      cursor,
      subscriptionID,
      skip_prev
    } = options;

    let url = SystemLogUtil.getUrl(nodeID, options, false);
    subscriptionID = subscriptionID || global.btoa(url);
    let source = new EventSource(url, {
      withCredentials: Boolean(CookieUtils.getUserMetadata())
    });

    let items = [];
    let hasReachedTop = false;

    source.addEventListener('message', function ({data, origin, eventPhase} = {}) {
      if (origin !== global.location.origin && eventPhase !== EventSource.OPEN) {
        // Event is not from same origin, or is not open anymore
        return false;
      }

      let parsedData = JSON.parse(data);
      if (!hasReachedTop && skip_prev > 0 && parsedData.cursor === cursor) {
        hasReachedTop = true;
      }
      if (!hasReachedTop) {
        items.push(parsedData);
      }
    }, false);

    source.addEventListener('error', (event = {}) => {
      let {eventPhase} = event;
      if (eventPhase === EventSource.CLOSED) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
          data: items,
          subscriptionID,
          hasReachedTop
        });
      } else {
        AppDispatcher.handleServerAction({
          type: REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
          data: event,
          subscriptionID
        });
      }
      source.close();
    });
  }
};

module.exports = SystemLogActions;
