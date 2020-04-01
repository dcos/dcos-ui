import { timer, Observable } from "rxjs";
import { delayWhen, retryWhen, scan } from "rxjs/operators";

export const retryWithLinearBackoff = <A>({
  delay = 500,
  maxRetries = 5,
  maxDelay = 2000,
} = {}) => (source: Observable<A>) =>
  source.pipe(
    retryWhen((errors) =>
      errors.pipe(
        scan((count, error) => {
          if (maxRetries >= 0 && count >= maxRetries) {
            throw error;
          }

          return count + 1;
        }, 0),
        delayWhen((val) => timer(Math.min(val * delay, maxDelay)))
      )
    )
  );
