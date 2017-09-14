import Rx from "rxjs";
import parseRecordioRecords from "../parseRecordioRecords";

describe("#parseRecordioRecords", function() {
  it("extracts recordio records from a growing sequense of chunks", function(
    done
  ) {
    const chunks = ['11\n{"test": 1}', '11\n{"test": 1}14\n{"another": 2}'];

    parseRecordioRecords(Rx.Observable.from(chunks))
      .reduce((acc, current) => acc.concat(current), [])
      .subscribe(function(value) {
        expect(value).toEqual([{ test: 1 }, { another: 2 }]);

        done();
      });
  });
});
