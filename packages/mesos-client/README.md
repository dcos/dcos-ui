# Apache Mesos Client

This package provides a nice way of connecting to the Mesos Event Stream API. It is a wrapper that uses `http-service` to establish a connection and `recordio` package to parse the incoming data and deliver it as a `Rx.Observable`.

## Example
```javascript
import { stream, request } from "mesos-client";

stream({ type: "SUBSCRIBE" }).subscribe(
  value => console.log(value),
  error => console.log(error),
  () => console.log("complete")
);

request({ type: "GET_FLAGS" }).subscribe(
  value => console.log(value),
  error => console.log(error),
  () => console.log("complete")
);
```

`stream` opens a persistent connection to [Mesos HTTP Operator Api](http://mesos.apache.org/documentation/latest/operator-http-api) Event Stream and returns `rxjs` Observable.

`request` makes a call to the [Mesos HTTP Operator Api](http://mesos.apache.org/documentation/latest/operator-http-api)  and returns response as an `rxjs` Observable.
