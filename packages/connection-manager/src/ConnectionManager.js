import { AbstractConnection, ConnectionEvent } from "connections";
import ConnectionQueue from "./ConnectionQueue.js";

/**
 * The Connection Manager which is responsible for
 * queuing Connections into the ConnectionQueue and
 * actually starting them, when they are head of
 * waiting line.
 */
export default class ConnectionManager {
  /**
   * Initializes an Instance of ConnectionManager
   *
   * @param {int} maxConnections – max open connections
   */
  constructor(maxConnections = 1) {
    /**
     * Private Context
     *
     * @typedef {Object} ConnectionManager~Context
     */
    const context = {
      /**
       * @property {ConnectionManager} instance
       * @description Current connection manager instance
       * @name ConnectionManager~Context#instance
       */
      instance: this,

      /**
       * @property {ConnectionQueue} waitingConnections
       * @description List of waiting connections ordered by priority
       * @name ConnectionManager~Context#waitingConnections
       */
      waitingConnections: new ConnectionQueue(),

      /**
       * @property {List} openConnections
       * @description List of open connections
       * @name ConnectionManager~Context#next
       */
      openConnections: new ConnectionQueue(),

      /**
       * @property {function} next
       * @description Opens the the connection if there's a free slot.
       * @name ConnectionManager~Context#next
       */
      next() {
        if (
          context.openConnections.size >= maxConnections ||
          context.waitingConnections.size === 0
        ) {
          return;
        }

        const connection = context.waitingConnections.first();

        if (connection.state === AbstractConnection.INIT) {
          connection.open(connection.url);
        }

        if (connection.state === AbstractConnection.OPEN) {
          context.openConnections = context.openConnections.enqueue(connection);
        }

        // after added to open list, we can remove it from waiting
        context.waitingConnections = context.waitingConnections.shift();
        context.next();
      },

      /**
       * @property {function} handleConnectionAbort
       * @name ConnectionManager~Context#handleConnectionAbort
       * @param {ConnectionEvent} event
       */
      handleConnectionAbort: event => {
        this.dequeue(event.target);
      },

      /**
       * @property {function} handleConnectionComplete
       * @name ConnectionManager~Context#handleConnectionComplete
       * @param {ConnectionEvent} event
       */
      handleConnectionComplete: event => {
        this.dequeue(event.target);
      },

      /**
       * @property {function} handleConnectionError
       * @name ConnectionManager~Context#handleConnectionError
       * @param {ConnectionEvent} event
       */
      handleConnectionError: event => {
        this.dequeue(event.target);
      }
    };

    this.enqueue = this.enqueue.bind(context);
    this.dequeue = this.dequeue.bind(context);
  }

  /**
   * Queues given connection with given priority
   *
   * @this ConnectionManager~Context
   * @param {AbstractConnection} connection – connection to queue
   * @param {Integer} [priority] – optional change of priority
   */
  enqueue(connection, priority) {
    if (connection.state === AbstractConnection.CLOSED) {
      return;
    }

    if (connection.state === AbstractConnection.INIT) {
      this.waitingConnections = this.waitingConnections.enqueue(
        connection,
        priority
      );
    }

    if (connection.state === AbstractConnection.OPEN) {
      this.openConnections = this.openConnections.enqueue(connection);
    }

    connection.addListener(ConnectionEvent.ABORT, this.handleConnectionAbort);

    connection.addListener(
      ConnectionEvent.COMPLETE,
      this.handleConnectionComplete
    );

    connection.addListener(ConnectionEvent.ERROR, this.handleConnectionError);

    this.next();
  }

  /**
   * Dequeues given connection
   *
   * @this ConnectionManager~Context
   * @param {AbstractConnection} connection – connection to dequeue
   */
  dequeue(connection) {
    this.waitingConnections = this.waitingConnections.dequeue(connection);
    this.openConnections = this.openConnections.dequeue(connection);

    connection.removeListener(
      ConnectionEvent.ABORT,
      this.handleConnectionAbort
    );
    connection.removeListener(
      ConnectionEvent.COMPLETE,
      this.handleConnectionComplete
    );
    connection.removeListener(
      ConnectionEvent.ERROR,
      this.handleConnectionError
    );

    if (connection.state === AbstractConnection.OPEN) {
      connection.close();
    }

    this.next();
  }
}
