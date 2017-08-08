import { EventEmitter } from "events";
// import ConnectionEvent from "../ConnectionEvent/ConnectionEvent";

/**
 * AbstractConnection provides some default properties, methods, states and event-definitions used by Connection Manager
 *
 * Events which MUST be fired by all SubClasses:
 * OPEN: when the connection actually blocks a pipe
 * DATA: everytime data is recieved from the server
 * CLOSE: when the connection frees its pipe
 * ERROR: when an error occurs
 */
export default class AbstractConnection extends EventEmitter {
  constructor(url) {
    super();

    if (this.constructor === AbstractConnection) {
      throw new Error("Can't instantiate abstract class!");
    }

    if (!url) {
      throw new Error("Can't instantiate without given URL!");
    }
    Object.defineProperty(this, "url", {
      get: () => url
    });

    const created = Date.now();
    Object.defineProperty(this, "created", {
      get: () => created
    });

    let state = AbstractConnection.INIT;
    Object.defineProperty(this, "state", {
      get: () => state,
      set: _state => {
        if (
          ![
            AbstractConnection.INIT,
            AbstractConnection.STARTED,
            AbstractConnection.DONE,
            AbstractConnection.CANCELLED
          ].includes(_state)
        ) {
          throw new Error("Cant set Connection into unknown state.");
        }
        state = _state;
      }
    });

    const symbol = Symbol("Connection:" + this.url + this.created);
    Object.defineProperty(this, "symbol", {
      get: () => symbol
    });
  }
  static get INIT() {
    return Symbol.for("DCOS.ConnectionManager.AbstractConnection.INIT");
  }
  static get STARTED() {
    return Symbol.for("DCOS.ConnectionManager.AbstractConnection.STARTED");
  }
  static get DATA() {
    return Symbol.for("DCOS.ConnectionManager.AbstractConnection.DATA");
  }
  static get DONE() {
    return Symbol.for("DCOS.ConnectionManager.AbstractConnection.DONE");
  }
  static get CANCELLED() {
    return Symbol.for("DCOS.ConnectionManager.AbstractConnection.CANCELLED");
  }

  // Abstract Methods
  /* eslint-disable no-unused-vars */
  /**
   * Opens the connection
   * This method should only be called by Connection Manager, if you want to call it by yourself be sure you know what you're doing.
   * Also this method should be the point where a Connection actually starts using a "Connection Pipe" of the browser.
   * @param {string} token – Authentication token
   */
  open(token) {}
  /**
   * Closes the connection
   * This method should free the "Connection Pipe" of the browser and do everything needed to tear down the connection
   */
  close() {}
  /**
   * Resets the connection
   * This method should reset the Connection in a way that open() can be called again.
   */
  reset() {}
}
