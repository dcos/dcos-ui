require("babel-polyfill");
require("reflect-metadata");
var EventEmitter = require("events").EventEmitter;

global.MARATHON_NAME = "marathon";
global.MARATHON_API_PREFIX = "/service/marathon/v2";

// Tests should just mock responses for the json API
// so let's just default to a noop
const { RequestUtil } = require("mesosphere-shared-reactjs");

RequestUtil.json = _ => {};

/*
 * Mock the EventSource using the functionality of EventEmitter,
 * which mimics the functionality of the EventTarget interface.
 * We are in this case mocking the EventSource, since it is not supported in
 * Jest.
 */
global.EventSource = () => {
  const eventEmitter = Object.create(EventEmitter.prototype);

  // Transfer functionality from EventEmitter to our fake EventSource object
  return {
    addEventListener: eventEmitter.addListener,
    close: eventEmitter.removeAllListeners,
    dispatchEvent: eventEmitter.emit,
    removeEventListener: eventEmitter.removeListener
  };
};

// Constants available on EventSource
global.EventSource.CONNECTING = 0;
global.EventSource.OPEN = 1;
global.EventSource.CLOSED = 2;
