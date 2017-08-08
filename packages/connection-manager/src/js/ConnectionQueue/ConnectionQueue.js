import { List } from "immutable";
import ConnectionQueueItem from "./ConnectionQueueItem";

/**
 * Connection List which holds ConnectionQueueItems which hold Connections :).
 * It wraps Immutable.List because we cant extend it easily
 * (see https://github.com/facebook/immutable-js/issues/301)
 * Also is immutable itself.
 */
export default class ConnectionQueue {
  /**
   * Initializes an instance of ConnectionQueue
   * @constructor
   * @param {Set} connections – Set of Connections
   */
  constructor(connections = List()) {
    if (!List.isList(connections)) {
      throw new Error("Given list has to be an instance of List.");
    }
    Object.defineProperty(this, "connections", {
      get: () => connections
    });
  }

  /**
   * Return current size of queue
   * @return {integer} size of queue
   */
  get size() {
    return this.connections.size;
  }

  /**
   * returns head of Set - no removal
   * @return {AbstractConnection} – head Connection
   */
  first() {
    if (this.connections.first() === undefined) {
      throw new Error("Cant get first() from empty Queue");
    }

    return this.connections.first().connection;
  }

  /**
   * returns a new List without the first Element
   * @return {ConnectionQueue} – new ConnectionQueue without first Connection
   */
  shift() {
    return new ConnectionQueue(this.connections.shift());
  }

  /**
   * Adds given connection with given (or default) priority to queue
   * @param {AbstractConnection} connection – Connection to be added to queue
   * @param {Integer} priority – priority of connection
   * @return {ConnectionQueue} – new ConnectionQueue containing the added Connection
   */
  enqueue(connection, priority) {
    return new ConnectionQueue(
      this.connections
        .push(new ConnectionQueueItem(connection, priority))
        .sort((a, b) => {
          return Math.min(Math.max(a.priority >= b.priority, -1), 1);
        })
    );
  }

  /**
   * removes a connection from store
   * @param {AbstractConnection} connection – connection to be deleted
   * @return {AbstractConnection} removed connection
   */
  dequeue(connection) {
    const index = this.connections.findIndex(v =>
      v.equals(new ConnectionQueueItem(connection))
    );
    if (index === -1) {
      return this;
    }

    return new ConnectionQueue(this.connections.delete(index));
  }

  /**
   * checks if a connection is already enqueued
   * @param {AbstractConnection} connection – given connection to check for
   * @return {bool} – true: queued, false: unknown
   */
  contains(connection) {
    return this.connections.some(v =>
      v.equals(new ConnectionQueueItem(connection))
    );
  }
}
