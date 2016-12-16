import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
  REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
  REQUEST_SYSTEM_LOG_ERROR,
  REQUEST_SYSTEM_LOG_SUCCESS,
  REQUEST_SYSTEM_LOG_STREAM_TYPES_ERROR,
  REQUEST_SYSTEM_LOG_STREAM_TYPES_SUCCESS
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import CookieUtils from '../utils/CookieUtils';
import Config from '../config/Config';
import SystemLogUtil from '../utils/SystemLogUtil';

/**
 * Implementation of server sent event handling for
 * https://github.com/dcos/dcos-log
 */

// Store of current open connections
const sources = {};
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
   * @param {String} [options.read_reverse] will read events in reverse order if set to true
   * @return {Symbol} subscriptionID to ubsubscribe or resubscribe with
   */
  subscribe(nodeID, options = {}) {
    let {subscriptionID, cursor, skip_prev} = options;

    // Unsubscribe if any open connection exists with the same ID
    this.unsubscribe(subscriptionID);

    const url = SystemLogUtil.getUrl(nodeID, options);
    subscriptionID = subscriptionID || Symbol(url + Date.now());
    const source = new EventSource(url, {
      withCredentials: Boolean(CookieUtils.getUserMetadata())
    });

    function messageListener({data, origin} = {}) {
      if (origin !== global.location.origin) {
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

      // Skip if we are hitting the same cursor as we requested with and we are
      // not looking backwards
      if (parsedData.cursor === cursor && !skip_prev) {
        return false;
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
      const {errorListener, messageListener, source} = sources[subscriptionID];
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
    let {limit, subscriptionID} = options;
    const url = SystemLogUtil.getUrl(
      nodeID,
      // Avioding duplicate events by using read reverse (stream backwards).
      // Connection will close all events are received or have reached the top
      Object.assign(options, {read_reverse: true}),
      false
    );
    subscriptionID = subscriptionID || Symbol(url + Date.now());
    const source = new EventSource(url, {
      withCredentials: Boolean(CookieUtils.getUserMetadata())
    });

    const items = [];
    function messageListener({data, origin} = {}) {
      if (origin !== global.location.origin) {
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

      items.push(parsedData);
    }

    function errorListener(event = {}) {
      const {eventPhase} = event;

      if (eventPhase === EventSource.CLOSED) {
        // Reverse the items, as the come in opporsite order
        items.reverse();
        AppDispatcher.handleServerAction({
          type: REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
          data: items,
          firstEntry: items.length < limit,
          subscriptionID
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
  },

  fetchStreamTypes(nodeID) {
    RequestUtil.json({
      url: `${Config.logsAPIPrefix}/${nodeID}/logs/v1/fields/STREAM`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_SYSTEM_LOG_STREAM_TYPES_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_SYSTEM_LOG_STREAM_TYPES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  }
};

module.exports = SystemLogActions;
