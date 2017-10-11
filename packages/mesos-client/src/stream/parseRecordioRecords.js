import Rx from "rxjs";
import readRecordioRecords from "./readRecordioRecords";

export default function parseRecordioRecords(resource) {
  return resource
    .scan(readRecordioRecords, {})
    .map(({ records }) => Rx.Observable.from(records))
    .concatAll()
    .map(record => JSON.parse(record));
}
