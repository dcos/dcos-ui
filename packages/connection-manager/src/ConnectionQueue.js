import { List } from "immutable";
import ConnectionQueueItem from "./ConnectionQueueItem";

/**
 * Connection Queue
 *
 * The queue is prioritized to enable dynamic connection handling and
 * best utilize the bandwidth available.
 *
 * This impl. wraps `Immutable.List` instead of extending `List` due to
 * https://github.com/facebook/immutable-js/issues/301
 */
export default class ConnectionQueue {
  /**
   * Initializes an instance of ConnectionQueue
   * @param {Set} connections – list of connections
   */
  constructor(connections = List()) {
    if (!List.isList(connections)) {
      throw new Error(
        "Given list of connection must to be an instance of List."
      );
    }

    /**
     * @property {List}
     * @name ConnectionQueue#connections
     */
    Object.defineProperty(this, "connections", { value: connections });
  }

  /**
   * Return current size of queue
   * @return {int} size of queue
   */
  get size() {
    return this.connections.size;
  }

  /**
   * returns the first connection
   * @return {AbstractConnection} - first connection
   */
  first() {
    if (this.connections.first() === undefined) {
      return undefined;
    }

    return this.connections.first().connection;
  }

  /**
   * returns a new queue without the first connection
   * @return {ConnectionQueue} – ConnectionQueue without first connection
   */
  shift() {
    return new ConnectionQueue(this.connections.shift());
  }

  /**
   * Adds given connection to queue
   * @param {AbstractConnection} connection – Connection to be added to queue
   * @param {Integer} [priority] – priority of connection
   * @return {ConnectionQueue} - ConnectionQueue containing the added connection
   */
  enqueue(connection, priority) {
    const item = new ConnectionQueueItem(connection, priority);
    const index = this.connections.findIndex(listItem => listItem.equals(item));
    let connections = null;

    if (index !== -1) {
      connections = this.connections.update(index, item);
    } else {
      connections = this.connections.push(item);
    }

    connections = connections.sort(({ priority: a }, { priority: b }) => {
      if (a > b) {
        return -1;
      }

      if (a < b) {
        return 1;
      }

      return 0;
    });

    return new ConnectionQueue(connections);
  }

  /**
   * removes a connection from queue
   * @param {AbstractConnection} connection – connection to be deleted
   * @return {ConnectionQueue} - ConnectionQueue without the resp. connection
   */
  dequeue(connection) {
    const item = new ConnectionQueueItem(connection);

    return new ConnectionQueue(
      this.connections.filter(listItem => !listItem.equals(item))
    );
  }

  includes(connection) {
    const item = new ConnectionQueueItem(connection);

    return this.connections.some(listItem => listItem.equals(item));
  }
}
