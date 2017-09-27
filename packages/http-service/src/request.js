import Rx from "rxjs";

import ConnectionManager from "connection-manager";
import { XHRConnection, ConnectionEvent } from "connections";

export default function request(url, options = {}) {
  return Rx.Observable.create(function(observer) {
    const connection = new XHRConnection(url, options);

    connection.addListener(ConnectionEvent.ERROR, function(event) {
      observer.error({
        code: event.target.xhr.status,
        message: event.target.xhr.statusText
      });
    });

    connection.addListener(ConnectionEvent.COMPLETE, function(event) {
      observer.next(event.target.response);
      observer.complete();
    });

    ConnectionManager.enqueue(connection);

    // Closing the connection when there are no subscribers left
    return function teardown() {
      ConnectionManager.dequeue(connection);
    };
  });
}
