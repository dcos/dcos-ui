import { timer } from "rxjs/observable/timer";

import "rxjs/add/operator/delayWhen";
import "rxjs/add/operator/scan";

/* eslint-disable import/prefer-default-export */
/**
 * linearBackoff callback to use with e.g. delayWhen
 *
 * @param  {number} delay
 * @param  {number} [maxRetries=-1]
 * @param  {number} [maxDelay=Number.MAX_SAFE_INTEGER]
 * @param  {Scheduler} [scheduler=null]
 * @return {Observable} notifier obervable
 */
export function linearBackoff(delay, maxRetries = -1, maxDelay, scheduler) {
  return errors =>
    errors
      .scan((count, error) => {
        if (maxRetries >= 0 && count >= maxRetries) {
          throw error;
        }

        return count + 1;
      }, 0)
      .delayWhen(val =>
        timer(
          Math.min(val * delay, maxDelay || Number.MAX_SAFE_INTEGER),
          undefined,
          scheduler
        )
      );
}
