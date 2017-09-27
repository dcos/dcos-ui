import { EventEmitter } from "events";

/**
 * Connection init state
 *
 * @constant
 * @type {Symbol}
 */
const INIT = Symbol("INIT");

/**
 * Connection started state
 *
 * @constant
 * @type {Symbol}
 */
const OPEN = Symbol("OPEN");

/**
 * Connection done state
 *
 * @constant
 * @type {Symbol}
 */
const CLOSED = Symbol("CLOSED");

/**
 * The `AbstractConnection` provides default properties, methods, states and
 * event-definitions. Extend this class when creating a custom connection type
 * to make sure it's compatible with the `ConnectionManager`.
 *
 * Use the following events to communicate state changes:
 *
 * - `OPEN` when the connection actually blocks a pipe
 * - `DATA` every time data is received from the server
 * - `ERROR` when an error occurred
 * - `COMPLETE` when the connection frees its pipe
 * - `ABORT` when the connection is aborted
 */
export default class AbstractConnection extends EventEmitter {
  /**
   * Abstract connection
   * @param {string} url
   */
  constructor(url) {
    super();

    if (this.constructor === AbstractConnection) {
      throw new Error("Can't instantiate abstract class!");
    }

    if (!url) {
      throw new Error("Can't instantiate without given URL!");
    }

    /**
     * @property {string}
     * @name AbstractConnection#url
     */
    Object.defineProperty(this, "url", { value: url });

    /**
     * @property {number}
     * @name AbstractConnection#created
     */
    Object.defineProperty(this, "created", { value: Date.now() });

    /**
     * @property {Symbol}
     * @protected
     * @name AbstractConnection#state
     */
    let state = AbstractConnection.INIT;
    Object.defineProperty(this, "state", {
      get: () => state,
      set: value => {
        if (![INIT, OPEN, CLOSED].includes(value)) {
          throw new Error(
            `Cant set connection into "${value}" state, allowed states are INIT, OPEN, CLOSED`
          );
        }
        state = value;
      }
    });
  }

  /**
   * @description Connection State after Initialization
   * initial state, cant be set again by client
   */
  static get INIT() {
    return INIT;
  }

  /**
   * @description Connection State while occupiing one "browser pipe"
   * active state, change is only allowed to AbstractConnection.CLOSED
   */
  static get OPEN() {
    return OPEN;
  }

  /**
   * @description Connection State after freeing the pipe.
   * terminal state, no more state changed allowed
   */
  static get CLOSED() {
    return CLOSED;
  }

  /**
   * Opens the connection
   *
   * @description This method should only be called by Connection Manager,
   * if you call it yourself, be sure you know what you're doing.
   * Also this method should be the point where a Connection actually starts
   * using a "Connection Pipe" of the browser.
   *
   * Furthermore, you have to bind the follwing events in this functions:
   * - OPEN when this function is called
   * - DATA everytime you get data from the server
   * - ERROR, ABORT, _or_ COMPLETE after the Connection is closed
   */
  open() {}

  /**
   * Closes the connection
   */
  close() {}
}
