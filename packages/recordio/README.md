# RecordIO

This package provides a function to read records in the RecordIO format from the input string.

## Usage

```javascript
import { read } from "recordio";

const [records, rest] = read(input);
```

Function `read` returns a tuple whose first element is an array of records and the second element is the rest part of the input that is either empty or contains partial records.

## RecordIO format

Prepends to a single record its length in bytes, followed by a newline and then the data:

The BNF grammar for a RecordIO-encoded streaming response is:
```
records         = *record

record          = record-size LF record-data

record-size     = 1*DIGIT
record-data     = record-size(OCTET)
```
`record-size` should be interpreted as an unsigned 64-bit integer (uint64).

For example, a stream may look like:

```
121\n
{"type": "SUBSCRIBED","subscribed": {"framework_id": {"value":"12220-3440-12532-2345"},"heartbeat_interval_seconds":15.0}20\n
{"type":"HEARTBEAT"}675\n
...
```

Further documentation can be found in the [Apache Mesos documentation](http://mesos.apache.org/documentation/latest/scheduler-http-api/#recordio-response-format).
