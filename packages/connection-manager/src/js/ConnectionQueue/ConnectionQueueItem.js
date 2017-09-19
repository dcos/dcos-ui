import AbstractConnection from "../Connection/AbstractConnection";

/**
 * Internal Item for ConnectionStore, stores priority & connection
 */

export const DEFAULT_PRIORITY = 0;
export const MINIMUM_PRIORITY = DEFAULT_PRIORITY;

export default class ConnectionQueueItem {
  /**
   * Inits new Item with given Connection & Priority
   * @param {AbstractConnection} connection – given connection
   * @param {int} [priority=DEFAULT_PRIORITY] – given priority
   */
  constructor(connection, priority = DEFAULT_PRIORITY) {
    Object.defineProperty(this, "connection", {
      get: () => connection
    });

    Object.defineProperty(this, "priority", {
      get: () => priority
    });

    if (!(connection instanceof AbstractConnection)) {
      throw new Error(
        "Invalid Connection, has to be an instance of AbstractConnection."
      );
    }

    if (typeof priority !== "number" || priority < MINIMUM_PRIORITY) {
      throw new Error(
        "Invalid Priority, has to be a number greater then " +
          MINIMUM_PRIORITY +
          "."
      );
    }
  }
  /**
   * Checks if Connection in Item is the same
   * see: https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#equals-java.lang.Object-
   *
   * Does NOT check priority.
   *
   * @param {ConnectionListItem} item – given item to compare
   * @return {boolean} – true: same, false: differs
   */
  equals(item) {
    return this.connection === item.connection;
  }
}
