import { marbles } from "rxjs-marbles/jest";
import { Observable } from "rxjs/Observable";
import { compareStream } from "../UpdateStream";

describe("Compare stream", function() {
  const filteredDismissedVersionValue = "2.24.2";
  const fetchedVersionObjectOld = {
    code: 200,
    message: "OK",
    response: {
      results: {
        "2.24.2": "0"
      }
    }
  };
  const fetchedVersionObject = {
    code: 200,
    message: "OK",
    response: {
      results: {
        "2.24.4": "0"
      }
    }
  };

  it(
    "emits version number when new version has not already been dismissed",
    marbles(function(m) {
      m.bind();

      const filteredDismissedVersion = Observable.of(
        filteredDismissedVersionValue
      );
      const fetchedVersion = Observable.of(fetchedVersionObject);

      const source = compareStream(
        m.time("--|"),
        filteredDismissedVersion,
        fetchedVersion
      ).take(1);
      const expected = m.cold("(a|)", { a: "2.24.4" });

      m.expect(source).toBeObservable(expected);
    })
  );

  it(
    "does not emit version number when new version has already been dismissed",
    marbles(function(m) {
      m.bind();

      const filteredDismissedVersion = m.cold("a---|", { a: "2.24.2" });
      const fetchedVersion = m.cold("a-b-|", {
        a: fetchedVersionObjectOld,
        b: fetchedVersionObject
      });

      // First fetchedVersion should NOT be emitted by source because it has already
      // been dismissed. Second fetchedVersion SHOULD be emitted because it is a higher
      // version that dismissed version.
      // So if we take(1) here, we should only get the second fetchedVersion.
      const source = compareStream(
        m.time("--|"),
        filteredDismissedVersion,
        fetchedVersion
      ).take(1);
      const expected = m.cold("--(a|)", { a: "2.24.4" });

      m.expect(source).toBeObservable(expected);
    })
  );
});
