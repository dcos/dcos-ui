# Connections

This package provides different connection types with a unified interface.

## Example

The following example will create an `XHRConnection`, add a complete event 
listener and open the connection. The complete listener will get called once 
the JSON file is loaded and the connection is closed.

```javascript
import { XHRConnection, ConnectionEvent } from "connections";

const connection = new XHRConnection("http://example.com/file.json");
connection.addListener(ConnectionEvent.COMPLETE, (event) => console.log(event));
connection.open();
```

## Abstract Connection

The `AbstractConnection` provides the default properties, methods, states, and 
event-definitions to implement a custom connection.

## Connection Event

The `ConnectionEvent` provides a common interface for all different event types. 

### Types

Use the following event types...

 * `OPEN` when opening the connection
 * `DATA` every time data is received from the server
 * `ERROR` when an error occurred
 * `COMPLETE` when the connection closes without any errors
 * `ABORT` when the connection was aborted by something

### Target

The event `target` always points to the connection.

## XHR Connection

The `XHRConnection` wraps the native `XMLHttpRequest` to provide a unified and 
easy to use interface. 

### Example

The following example will create an `XHRConnection` to post  "data" to an 
API server.

```javascript
const connection = new XHRConnection("http://example.com/api", {
  method: "POST",
  body: "data"
});
connection.open();
```

### Parameters

#### URL

This defines the resource location that you want to connect to. 

#### Options (Optional)

An optional object containing custom settings that you want to apply to the connection. 

* `headers`: Any headers you want to add to your request
* `method`: The request method (default: `"GET"`)
* `body`:  Any data you want send with your request
* `responseType`:  The response type you expect (default: `"json"`) If the server returns data that is not compatible the value of `response` will be `null`.

##### Response Types

Value | Data type of response property
-- | --
"arraybuffer" | ArrayBuffer
"blob" | Blob
"document" | Document
"json" | JavaScript object, parsed from a JSON string returned by the server
"text" | DOMString
