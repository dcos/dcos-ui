import { Subject } from "rxjs";
import "rxjs/add/operator/combineLatest";

import { jobsRunNowAction, jobsRunNow$ } from "./JobsRunNow";

const actions$ = new Subject();

export default function(actions, jobId) {
  const [edit, ...rest] = actions;
  const newActions = [];

  newActions.push(edit);

  newActions.push(jobsRunNowAction(jobId));

  actions$.subscribe(() => {
    console.log(newActions);

    return newActions.concat(rest);
  });
  actions$.mergeMap(jobsRunNow$);

  return actions$;
}
