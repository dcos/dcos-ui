import { AbstractConnection } from "connections";

export const DEFAULT_PRIORITY = 0;
export const MINIMUM_PRIORITY = DEFAULT_PRIORITY;

export default class ConnectionQueueItem {
  /**
   * @param {AbstractConnection} connection – given connection
   * @param {int} [priority=DEFAULT_PRIORITY] – given priority
   */
  constructor(connection, priority = DEFAULT_PRIORITY) {
    if (!(connection instanceof AbstractConnection)) {
      throw new Error(
        "Invalid Connection, has to be an instance of AbstractConnection."
      );
    }

    if (!Number.isSafeInteger(priority) || priority < MINIMUM_PRIORITY) {
      throw new Error(
        "Invalid Priority, has to be a number greater than " +
          MINIMUM_PRIORITY +
          "."
      );
    }

    /**
     * @property {AbstractConnection}
     * @name ConnectionQueueItem#connection
     */
    Object.defineProperty(this, "connection", { value: connection });

    /**
     * @property {int}
     * @name ConnectionQueueItem#priority
     */
    Object.defineProperty(this, "priority", { value: priority });
  }
  /**
   * Checks if Connection in Item is the same
   * see: https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#equals-java.lang.Object-
   *
   * Does NOT check priority.
   *
   * @param {ConnectionQueueItem} item – given item to compare
   * @return {boolean} – true: same, false: differs
   */
  equals(item) {
    return this.connection === item.connection;
  }
}
