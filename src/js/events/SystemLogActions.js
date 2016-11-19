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
  /**
   * Subscribes to the events stream for logs given the paramters provided
   * @param {String} nodeID ID of the node to retrieve logs from
   * @param {Object} [options] Optional parameters for request
   * @param {String} [options.cursor] ID of the cursor to request entries from
   * @param {String} [options.subscriptionID] ID to emit events to,
   *   if omitted a new one will be created
   * @param {Number} [options.skip_prev] how many entries backwards to look
   * @param {Number} [options.skip_next] how many entroes to look ahead
   * @param {Number} [options.limit] limit how many entries to receive
   * @param {Object} [options.filter] filter parameters to add to URL
   * @param {String} [options.frameworkID] ID for framework to retrieve logs from
   * @param {String} [options.executorID] ID for executor to retrieve logs from
   * @param {String} [options.containerID] ID for container to retrieve logs from
   * @return {Symbol} subscriptionID to ubsubscribe or resubscribe with
   */
  subscribe(nodeID, options = {}) {
    let {subscriptionID} = options;

    // Unsubscribe if any open connection exists with the same ID
    this.unsubscribe(subscriptionID);

    let url = SystemLogUtil.getUrl(nodeID, options);
    subscriptionID = subscriptionID || Symbol(url + Date.now());
    let source = new EventSource(url, {
      withCredentials: Boolean(CookieUtils.getUserMetadata())
    });

    function messageListener({data, origin, eventPhase} = {}) {
      if (origin !== global.location.origin && eventPhase !== EventSource.OPEN) {
        // Ignore events that are not from this origin
        return false;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        AppDispatcher.handleServerAction({
          type: REQUEST_SYSTEM_LOG_ERROR,
          data: error,
          subscriptionID
        });
      }

      AppDispatcher.handleServerAction({
        type: REQUEST_SYSTEM_LOG_SUCCESS,
        data: parsedData,
        subscriptionID
      });
    }

    function errorListener(event = {}) {
      AppDispatcher.handleServerAction({
        type: REQUEST_SYSTEM_LOG_ERROR,
        data: event,
        subscriptionID
      });
    }

    source.addEventListener('message', messageListener, false);
    source.addEventListener('error', errorListener, false);
    // Store listeners along with EventSource reference, so we can clean up
    sources[subscriptionID] = {errorListener, messageListener, source};

    return subscriptionID;
  },

  /**
   * Ubsubscribes from the event stream from the given subscriptionID
   * @param {String} subscriptionID ID returned from subcribe function
   */
  unsubscribe(subscriptionID) {
    if (sources[subscriptionID]) {
      // Clean up event listeners
      let {errorListener, messageListener, source} = sources[subscriptionID];
      source.removeEventListener('message', messageListener);
      source.removeEventListener('error', errorListener);
      source.close();
      delete sources[subscriptionID];
    }
  },

  /**
   * Fetches a range of log entries given the paramters provided
   * @param {String} nodeID ID of the node to retrieve logs from
   * @param {Object} [options] Optional parameters for request
   * @param {String} [options.cursor] ID of the cursor to request entries from
   * @param {String} [options.subscriptionID] ID to emit events to,
   *   if omitted a new one will be created
   * @param {Number} [options.skip_prev] how many entries backwards to look
   * @param {Number} [options.skip_next] how many entroes to look ahead
   * @param {Number} [options.limit] limit how many entries to receive
   * @param {Object} [options.filter] filter parameters to add to URL
   * @param {String} [options.frameworkID] ID for framework to retrieve logs from
   * @param {String} [options.executorID] ID for executor to retrieve logs from
   * @param {String} [options.containerID] ID for container to retrieve logs from
   */
  fetchLogRange(nodeID, options = {}) {
    let {cursor, subscriptionID, skip_prev} = options;

    let url = SystemLogUtil.getUrl(nodeID, options, false);
    subscriptionID = subscriptionID || Symbol(url + Date.now());
    let source = new EventSource(url, {
      withCredentials: Boolean(CookieUtils.getUserMetadata())
    });

    let items = [];
    let firstEntry = false;

    function messageListener({data, origin, eventPhase} = {}) {
      if (origin !== global.location.origin && eventPhase !== EventSource.OPEN) {
        // Ignore events that are not from this origin
        return false;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
          data: error,
          subscriptionID
        });
      }
      // If we want previous logs and see the cursor we requested data with,
      // we have reached the top
      if (!firstEntry && skip_prev > 0 && parsedData.cursor === cursor) {
        firstEntry = true;
      } else {
        items.push(parsedData);
      }
    }

    function errorListener(event = {}) {
      let {eventPhase} = event;
      if (eventPhase === EventSource.CLOSED) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
          data: items,
          subscriptionID,
          firstEntry
        });
      } else {
        AppDispatcher.handleServerAction({
          type: REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
          data: event,
          subscriptionID
        });
      }
      // Clean up event listeners
      source.removeEventListener('message', messageListener);
      source.removeEventListener('error', errorListener);
      source.close();
    }

    source.addEventListener('message', messageListener, false);
    source.addEventListener('error', errorListener, false);
  }
};

module.exports = SystemLogActions;
