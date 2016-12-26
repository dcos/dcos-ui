require('babel-polyfill');
var EventEmitter = require('events').EventEmitter;

// jsdom doesn't have support for localStorage at the moment
global.localStorage = require('localStorage');

// Tests should just mock responses for the json API
// so let's just default to a noop
var RequestUtil = require('mesosphere-shared-reactjs').RequestUtil;
RequestUtil.json = function () {};

// jsdom doesn't have support for requestAnimationFrame so we polyfill it.
// https://gist.github.com/paulirish/1579671
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];

  for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame']
      || global[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!global.requestAnimationFrame)
    global.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = global.setTimeout(
        function () {
          callback(currTime + timeToCall);
        },
        timeToCall
      );

      lastTime = currTime + timeToCall;

      return id;
    };

  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());

/*
 * Mock the EventSource using the functionality of EventEmitter,
 * which mimics the functionality of the EventTarget interface.
 * We are in this case mocking the EventSource, since it is not supported in
 * Jest.
 */
(function () {
  global.EventSource = function () {
    var eventEmitter = Object.create(EventEmitter.prototype);

    // Transfer functionality from EventEmitter to our fake EventSource object
    var fakeEventSource = {
      addEventListener: eventEmitter.addListener,
      close: eventEmitter.removeAllListeners,
      dispatchEvent: eventEmitter.emit,
      removeEventListener: eventEmitter.removeListener
    };

    return fakeEventSource;
  };

  // Constants available on EventSource
  global.EventSource.CONNECTING = 0;
  global.EventSource.OPEN = 1;
  global.EventSource.CLOSED = 2;
}());
