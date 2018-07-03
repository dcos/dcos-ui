import { timer } from "rxjs/observable/timer";

import "rxjs/add/operator/delayWhen";
import "rxjs/add/operator/scan";
import { IScheduler } from "rxjs/Scheduler";
import { Observable } from "rxjs/Observable";

export function linearBackoff(
  delay: number,
  maxRetries: number = -1,
  maxDelay?: number,
  scheduler?: IScheduler
): (errors: Observable<any>) => Observable<any> {
  return (errors: Observable<any>) =>
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
