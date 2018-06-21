import { timer } from "rxjs/observable/timer";

import "rxjs/add/operator/delayWhen";
import "rxjs/add/operator/scan";

/* eslint-disable import/prefer-default-export */
export function linearBackoff(
  maxRetries = 5,
  delay = 1000,
  maxDelay = Number.MAX_SAFE_INTEGER,
  scheduler = null
) {
  return errors =>
    errors
      .scan((count, error) => {
        if (count >= maxRetries) {
          throw error;
        }

        return count + 1;
      }, 0)
      .delayWhen(val =>
        timer(Math.min(val * delay, maxDelay), null, scheduler)
      );
}
