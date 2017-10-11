import Rx from "rxjs";
import readRecordioRecords from "../readRecordioRecords";

describe("#readRecordioRecords", function() {
  it("extracts recordio records from a growing sequense of chunks", function(
    done
  ) {
    const chunks = [
      "1\n1",
      "1\n12\n",
      "1\n12\n223\n333",
      "1\n12\n223\n3334\n",
      "1\n12\n223\n3334\n4444"
    ];

    Rx.Observable
      .from(chunks)
      .scan(readRecordioRecords, {})
      .reduce((acc, current) => acc.concat(current), [])
      .subscribe(function(value) {
        expect(value).toEqual([
          { records: ["1"], buffer: "", position: 3 },
          { records: [], buffer: "2\n", position: 5 },
          { records: ["22", "333"], buffer: "", position: 12 },
          { records: [], buffer: "4\n", position: 14 },
          { records: ["4444"], buffer: "", position: 18 }
        ]);

        done();
      });
  });
});
