import { Trans, DateFormat } from "@lingui/macro";

require("babel-polyfill");
require("reflect-metadata");
const EventEmitter = require("events").EventEmitter;

// Tests should just mock responses for the json API
// so let's just default to a noop
const { RequestUtil } = require("mesosphere-shared-reactjs");

RequestUtil.json = () => {};

// if you've come here: sorry!
// this is a workaround to make ts-jest play nice with babel-plugin-macros.
// unfortunately we could not use @babel/preset-typescript, as the decorators we have in the codebase can not be compiled by babel as is.
// the second problem is that ts-jest claims to be multistage (tsc -> babel), but it seems that it somehow does not respect the "target", so
// the output of tsc will mess with the imports so that "@lingui/babel-preset-react" does not pick them up to transform them.
// This means that we'll get a "can't find macro_1" when running tests without this workaround for now.
// It might be worthwhile to dig into ts-jest as to why it's transpiling ts-files differently.
global.macro_1 = {
  DateFormat,
  Plural: ({ one }) => one,
  Trans,
  t: (...args) => args.join("")
};

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
