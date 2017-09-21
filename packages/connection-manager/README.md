# Connection Manager

This package allows to manage connections inside the browser and order them in a queue by priority.

Browsers can open only a limited amount of connections so when you urgently need one there may not be a slot. This package solves the issue by providing a manager that enqueues all requested connections and priorities them accordingly.

## Usage

```javascript
import { XHRConnection, ConnectionEvent } from "connections";
import ConnectionManager from "connection-manager";

const connection = new XHRConnection("http://127.0.0.1");
connection.on(ConnectionEvent.CLOSE, function(event) {
  // doing something with event.target.response
});
ConnectionManager.enqueue(connection);
```

Connection will be opened by the manager once there's a slot available.

## Connection types

At the moment `connection-manager` package exposes only one connection `XHRConnection` that wraps `XmlHttpRequest`

```javascript
const connection = new XHRConnection("http://127.0.0.1", {
  method: "POST",
  body: "{}",
  contentType: "json"
});
```

## Creating your own connection type

If you want to create your own connection type that will be compatible with the manager please extend `AbstractConnection`.
Have a look at `Connections/AbstractConnection.js` for more info.

