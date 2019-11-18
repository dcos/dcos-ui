import { Observable, of, timer } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { map, repeatWhen, shareReplay, switchMap } from "rxjs/operators";
// @ts-ignore
import proto from "../mesos-proto";

const eventCoder = proto.lookup("Event");

const utf8Coder = new TextDecoder("utf-8");
const recordIOChunk$ = (
  reader: ReadableStreamDefaultReader<Uint8Array>
): Observable<Uint8Array> => {
  return new Observable(observer => {
    // a buffer to temporarily hold binary data that is streamed. it might be
    // that mesos streams less than a full chunk - that's why we need to store
    // that temporarily.
    let buffer = new Uint8Array();

    // @ts-ignore
    reader.read().then(function process({ done, value }) {
      if (done) {
        return observer.complete();
      }

      // append the data that's coming in to our buffer
      const newBuffer = new Uint8Array(buffer.length + value.length);
      newBuffer.set(buffer);
      newBuffer.set(value, buffer.length);
      buffer = newBuffer;

      // check if we have enough data in the buffer to emit a chunk
      const newlineIndex = buffer.indexOf(10) + 1;
      const chunkLengthStr = utf8Coder.decode(buffer.slice(0, newlineIndex));
      const chunkLength = parseInt(chunkLengthStr, 10);
      if (buffer.length >= chunkLength) {
        // emit a chunk
        const chunk = buffer.slice(newlineIndex, chunkLength + newlineIndex);
        observer.next(chunk);

        // remove emitted chunk from buffer
        buffer = buffer.slice(chunkLength + newlineIndex, buffer.length);
      }

      // handle next chunk
      return reader.read().then(process);
    });
  });
};

// The `toObject` is needed to convert enums into readable strings
const protobufToEvent = (chunk: Uint8Array) =>
  eventCoder.toObject(eventCoder.decode(chunk), { enums: String });

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
      return of(response.json());
    }

    if (!response.body) {
      throw Error("MesosStateStream does not contain data.");
    }

    return recordIOChunk$(response.body.getReader()).pipe(map(protobufToEvent));
  })
);

const RECONNECTION_DELAY = 2000;

export const MesosStreamType = Symbol("MesosStreamType");

export default mesos$.pipe(
  repeatWhen(() => timer(RECONNECTION_DELAY)),
  shareReplay(1) // somehow the first event gets lost. most likely because of weird subscription order. please try removing this and see whether there are still 2 requests to the subscribe endpoint. if not: yay!
);
