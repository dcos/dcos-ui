import AbstractConnection from "./AbstractConnection";

/**
 * Connection open event
 *
 * @constant
 * @type {Symbol}
 */
const OPEN = Symbol("OPEN");

/**
 * Connection data event
 *
 * @constant
 * @type {Symbol}
 */
const DATA = Symbol("DATA");

/**
 * Connection error event
 *
 * @constant
 * @type {Symbol}
 */
const ERROR = Symbol("ERROR");

/**
 * Connection complete event
 *
 * @constant
 * @type {Symbol}
 */
const COMPLETE = Symbol("COMPLETE");

/**
 * Connection abort event
 *
 * @constant
 * @type {Symbol}
 */
const ABORT = Symbol("ABORT");

/**
 * Basic Connection Event Object
 */
export default class ConnectionEvent {
  /**
   * Connection event
   * @param {AbstractConnection} target
   * @param {Symbol} type
   */
  constructor(target, type) {
    if (!(target instanceof AbstractConnection)) {
      throw new Error(
        `Invalid target, has to be an instance of Abstractconnection`
      );
    }

    if (![OPEN, DATA, ERROR, COMPLETE, ABORT].includes(type)) {
      throw new Error(
        `Invalid type "${type}", allowed types are OPEN, DATA, ERROR, COMPLETE, ABORT`
      );
    }

    /**
     * @property {AbstractConnection}
     * @name ConnectionEvent#target
     */
    Object.defineProperty(this, "target", { value: target });

    /**
     * @property {Symbol}
     * @name ConnectionEvent#type
     */
    Object.defineProperty(this, "type", { value: type });
  }

  static get OPEN() {
    return OPEN;
  }

  static get DATA() {
    return DATA;
  }

  static get ERROR() {
    return ERROR;
  }

  static get COMPLETE() {
    return COMPLETE;
  }

  static get ABORT() {
    return ABORT;
  }
}
