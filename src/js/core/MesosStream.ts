import { Observable, from, timer } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import utf8 from "@protobufjs/utf8";
import { map, repeatWhen, shareReplay, switchMap } from "rxjs/operators";
import proto from "../mesos-proto";

const MesosEvent = proto.lookup("Event");

// read a RecordIO-buffer and either return the next complete record or null.
const getNextRecord = (buffer: Uint8Array): Uint8Array | null => {
  const newlineIndex = buffer.indexOf(10);
  if (newlineIndex === -1) {
    // this commonly happens if we have consumed all records and the
    // buffer is now empty.
    return null;
  }

  const start = newlineIndex + 1;
  const recordLength = parseInt(utf8.read(buffer, 0, newlineIndex), 10);
  return buffer.length >= recordLength + start
    ? buffer.slice(start, start + recordLength)
    : null;
};

const removeRecord = (buffer: Uint8Array, record: Uint8Array): Uint8Array =>
  buffer.subarray(buffer.indexOf(10) + 1 + record.length, buffer.length);

const concatBuffers = (fst: Uint8Array, snd: Uint8Array): Uint8Array => {
  const newBuffer = new Uint8Array(fst.length + snd.length);
  newBuffer.set(fst);
  newBuffer.set(snd, fst.length);
  return newBuffer;
};

// Create a stream of RecordIO-records out of a chunked transmission.
const record$ = (
  reader: ReadableStreamDefaultReader<Uint8Array>
): Observable<Uint8Array> => {
  return new Observable(observer => {
    // a buffer to temporarily hold binary data that is streamed. it might be
    // that mesos streams less than a full record - that's why we need to store
    // that temporarily.

    let buffer = new Uint8Array();

    reader.read().then(function process({ done, value }) {
      if (done) {
        observer.complete();
        return;
      }

      // append the incoming chunk to the buffer
      buffer = concatBuffers(buffer, value);

      let record = getNextRecord(buffer);
      while (record) {
        // RecordIO prepends the length before the record itself.
        // Let's check if we have enough data to emit a record.
        observer.next(record);

        buffer = removeRecord(buffer, record);
        record = getNextRecord(buffer);
      }

      // handle next chunk
      return reader.read().then(process);
    });
  });
};

// The `toObject` is needed to convert enums into readable strings
const protobufToEvent = (record: Uint8Array) =>
  MesosEvent.toObject(MesosEvent.decode(record), { enums: String });

const mesos$ = fromFetch("/mesos/api/v1?subscribe", {
  method: "POST",
  body: JSON.stringify({ type: "SUBSCRIBE" }),
  headers: {
    Accept: "application/x-protobuf",
    "Content-Type": "application/json"
  }
}).pipe(
  switchMap(response => {
    if (!response) {
      throw Error("No response object returned for MesosStateStream");
    }

    // we only ever expect JSON to be served during integration-tests where
    // fixtures are served. There seems to be no easy workaround to not have
    // testing-related code in prod here, sorry!
    const contentType = response.headers.get("content-type") || "";
    if (contentType.match(/application\/json/)) {
      return from(response.json());
    }

    if (!response.body) {
      throw Error("MesosStateStream does not contain data.");
    }

    return record$(response.body.getReader()).pipe(map(protobufToEvent));
  })
);

const RECONNECTION_DELAY = 2000;

export const MesosStreamType = Symbol("MesosStreamType");

export default mesos$.pipe(
  repeatWhen(() => timer(RECONNECTION_DELAY)),
  shareReplay(1) // somehow the first event gets lost. most likely because of weird subscription order. please try removing this and see whether there are still 2 requests to the subscribe endpoint. if not: yay!
);
