import "rxjs/add/operator/retryWhen";
import { marbles } from "rxjs-marbles/jest";

import { linearBackoff } from "../rxjsUtils";

describe("linearBackoff", function() {
  it(
    "retries maxRetries times",
    // To setup marbles test env pass your function wrapped with `marbels`
    // it will inject Context as the first argument named `m` by convention
    marbles(function(m) {
      // with `m.bind` we bind all time dependent operators to a TestScheduler
      // so that we can use mocked time intervals.
      // But we also could create our own TestScheduler and use it instead.
      m.bind();

      const source = m.cold("1--2#");
      const expected = m.cold("1--2--1--2----1--2------1--2#");

      // In test env we don't want to wait for the real wall clock
      // so we encode time intervals with a special helper `m.time`
      const result = source.retryWhen(linearBackoff(3, m.time("--|")));

      m.expect(result).toBeObservable(expected);
    })
  );
});
