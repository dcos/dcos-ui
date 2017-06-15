import { RequestUtil } from "mesosphere-shared-reactjs";

import {
  REQUEST_PREVIOUS_SYSTEM_LOG_ERROR,
  REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
  REQUEST_SYSTEM_LOG_ERROR,
  REQUEST_SYSTEM_LOG_SUCCESS,
  REQUEST_SYSTEM_LOG_STREAM_TYPES_ERROR,
  REQUEST_SYSTEM_LOG_STREAM_TYPES_SUCCESS
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import CookieUtils from "../utils/CookieUtils";
import Config from "../config/Config";
import { accumulatedThrottle, getUrl } from "../utils/SystemLogUtil";

/**
 * Implementation of server sent event handling for
 * https://github.com/dcos/dcos-log
 */

const eventThroughPutTime = 500;
// Store of current open connections
const urlToEventSourceMap = {};
const subscriptionIDtoURLMap = {};

function subscribe(url, onMessage, onError) {
  // Unsubscribe if any open connection exists with the same ID
  unsubscribe(url);

  const source = new EventSource(url, {
    withCredentials: Boolean(CookieUtils.getUserMetadata())
  });

  source.addEventListener("message", onMessage, false);
  source.addEventListener("error", onError, false);

  // Store listeners along with EventSource reference, so we can clean up
  urlToEventSourceMap[url] = {
    errorListener: onError,
    messageListener: onMessage,
    source
  };

  return url;
}

function unsubscribe(url) {
  if (!urlToEventSourceMap[url]) {
    return;
  }

  const { errorListener, messageListener, source } = urlToEventSourceMap[url];

  source.removeEventListener("message", messageListener, false);
  source.removeEventListener("error", errorListener, false);

  source.close();

  delete urlToEventSourceMap[url];
}

function parseEvents(eventData) {
  const globalOrigin = global.location.origin;

  return eventData.reduce(
    function(memo, event) {
      // Only take first argument, which holds the event
      const { data, origin } = event[0] || {};
      if (origin !== globalOrigin) {
        // Ignore events that are not from this origin
        return memo;
      }

      try {
        // Attempt parsing
        const parsedEvent = JSON.parse(data);
        // Append when regular reverse order
        memo.events.push(parsedEvent);
      } catch (error) {
        memo.errors.push(error);
      }

      return memo;
    },
    { events: [], errors: [] }
  );
}

const SystemLogActions = {
  /**
   * Subscribes to the events stream for logs given the parameters provided
   * @param {String} nodeID ID of the node to retrieve logs from
   * @param {Object} [options] Optional parameters for request
   * @param {String} [options.cursor] ID of the cursor to request entries from
   * @param {String} [options.subscriptionID] ID to emit events to,
   *   if omitted a new one will be created
   * @param {Number} [options.skip_prev] how many entries backwards to look.
   * NB: This _needs_ to be present to start streaming from the bottom!!
   * @param {Number} [options.skip_next] how many entries to look ahead
   * @param {Number} [options.limit] limit how many entries to receive
   * @param {Object} [options.filter] filter parameters to add to URL
   * @param {String} [options.frameworkID] ID for framework to retrieve logs from
   * @param {String} [options.executorID] ID for executor to retrieve logs from
   * @param {String} [options.containerID] ID for container to retrieve logs from
   * @param {String} [options.read_reverse] will read events in reverse order if set to true
   * @return {Symbol} subscriptionID to unsubscribe or resubscribe with
   */
  startTail(nodeID, options = {}) {
    let { subscriptionID, cursor, skip_prev } = options;

    // NB: When subscriptionID is passed from the store and an ongoing stream
    // is open, it will close the connection before opening a new one
    this.stopTail(subscriptionID);

    const url = getUrl(nodeID, options);
    // NB: User can pass `subscriptionID` to associate it with their local data
    // accumulation
    subscriptionID = subscriptionID || Symbol.for(url);

    // Will receive an array of events through the accumulatedThrottle function
    function messageListener(eventData) {
      const { events, errors } = parseEvents(eventData);
      if (errors.length > 0) {
        // Some data was corrupt and could not be parsed
        AppDispatcher.handleServerAction({
          type: REQUEST_SYSTEM_LOG_ERROR,
          data: errors,
          subscriptionID
        });
      }

      // Skip if we are hitting the same cursor as we requested with and we are
      // not looking backwards. This is only relevant for the first item we hit
      if (!skip_prev && events[0] && events[0].cursor === cursor) {
        events.shift();
      }

      // No data to emit
      if (events.length <= 0) {
        return;
      }

      AppDispatcher.handleServerAction({
        type: REQUEST_SYSTEM_LOG_SUCCESS,
        data: events,
        subscriptionID
      });
    }

    const throttledMessageListener = accumulatedThrottle(
      messageListener,
      eventThroughPutTime
    );

    function errorListener(event = {}) {
      AppDispatcher.handleServerAction({
        type: REQUEST_SYSTEM_LOG_ERROR,
        data: event,
        subscriptionID
      });
    }

    subscriptionIDtoURLMap[subscriptionID] = url;

    subscribe(url, throttledMessageListener, errorListener);

    return subscriptionID;
  },

  /**
   * Unsubscribes from the event stream from the given subscriptionID
   * @param {String} subscriptionID ID returned from subscribe function
   */
  stopTail(subscriptionID) {
    if (!subscriptionIDtoURLMap[subscriptionID]) {
      return;
    }

    unsubscribe(subscriptionIDtoURLMap[subscriptionID]);
    delete subscriptionIDtoURLMap[subscriptionID];
  },

  /**
   * Fetches a range of log entries given the parameters provided
   * @param {String} nodeID ID of the node to retrieve logs from
   * @param {Object} [options] Optional parameters for request
   * @param {String} [options.cursor] ID of the cursor to request entries from
   * @param {String} [options.subscriptionID] ID to emit events to,
   *   if omitted a new one will be created
   * @param {Number} [options.skip_prev] how many entries backwards to look
   * @param {Number} [options.skip_next] how many entries to look ahead
   * @param {Number} [options.limit] limit how many entries to receive
   * @param {Object} [options.filter] filter parameters to add to URL
   * @param {String} [options.frameworkID] ID for framework to retrieve logs from
   * @param {String} [options.executorID] ID for executor to retrieve logs from
   * @param {String} [options.containerID] ID for container to retrieve logs from
   */
  fetchRange(nodeID, options = {}) {
    let { limit, subscriptionID } = options;
    const url = getUrl(
      nodeID,
      // Avoiding duplicate events by using read reverse (stream backwards).
      // Connection will close all events are received or have reached the top
      Object.assign(options, { read_reverse: true }),
      false
    );
    // NB: User can pass `subscriptionID` to associate it with their local data
    // accumulation
    subscriptionID = subscriptionID || Symbol.for(url);

    const items = [];

    function messageListener({ data, origin } = {}) {
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

      // Unshift items as the come in opposite order
      items.unshift(parsedData);
    }

    function errorListener(event = {}) {
      const { eventPhase } = event;

      if (eventPhase === EventSource.CLOSED) {
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

      unsubscribe(url);
    }

    subscribe(url, messageListener, errorListener);
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
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  }
};

module.exports = SystemLogActions;
