import jobsRunNow from "./jobsRunNow";

export default function(jobId) {
  return [jobsRunNow(jobId)];
}
