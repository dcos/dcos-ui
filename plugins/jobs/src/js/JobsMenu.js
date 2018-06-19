import jobsRunNowAction from "./JobsRunNow";

export default function(jobId) {
  const newActions = [];

  newActions.push(jobsRunNowAction(jobId));

  return newActions;
}
