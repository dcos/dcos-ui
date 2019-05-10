import { retryWhen, take } from "rxjs/operators";
import { marbles } from "rxjs-marbles/jest";

import { linearBackoff } from "../rxjsUtils";

describe("linearBackoff", function() {
  it(
    "retries maxRetries times",
    // To setup marbles test env pass your function wrapped with `marbels`
    // it will inject Context as the first argument named `m` by convention
    marbles(function(m) {
      const source = m.cold("1--2#");
      const expected = m.cold("1--2--1--2----1--2#");

      // In test env we don't want to wait for the real wall clock
      // so we encode time intervals with a special helper `m.time`
      const result = source.pipe(retryWhen(linearBackoff(m.time("--|"), 2)));

      m.expect(result).toBeObservable(expected);
    })
  );

  it(
    "retries infinitey when no maxRetries given",
    marbles(function(m) {
      const source = m.cold("1--2#");
      const expected = m.cold("1--2--1--2----1--2------1--(2|)");

      const result = source.pipe(retryWhen(linearBackoff(m.time("--|"))));
      m.expect(result.pipe(take(8))).toBeObservable(expected);
    })
  );

  it(
    "linearly grows the retry delay",
    marbles(function(m) {
      const source = m.cold("1--2#");
      const expected = m.cold("1--2--1--2----1--2------1--2#");

      const result = source.pipe(retryWhen(linearBackoff(m.time("--|"), 3)));
      m.expect(result).toBeObservable(expected);
    })
  );

  it(
    "delays the retry no longer than max delay",
    marbles(function(m) {
      const source = m.cold("1--2#");
      const expected = m.cold("1--2--1--2----1--2----1--2----1--2#");

      const result = source.pipe(
        retryWhen(linearBackoff(m.time("--|"), 4, m.time("----|")))
      );
      m.expect(result).toBeObservable(expected);
    })
  );
});
