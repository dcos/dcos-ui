import { timer, Scheduler, Observable } from "rxjs";
import { delayWhen, scan } from "rxjs/operators";

export function linearBackoff(
  delay: number,
  maxRetries: number = -1,
  maxDelay?: number,
  scheduler?: Scheduler
): (errors: Observable<any>) => Observable<any> {
  return (errors: Observable<any>) =>
    errors.pipe(
      scan((count, error) => {
        if (maxRetries >= 0 && count >= maxRetries) {
          throw error;
        }

        return count + 1;
      }, 0),
      delayWhen(val =>
        timer(
          Math.min(val * delay, maxDelay || Number.MAX_SAFE_INTEGER),
          undefined,
          scheduler
        )
      )
    );
}
