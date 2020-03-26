import { EnvModel, JobSpec, JobFormActionType } from "../helpers/JobFormData";

type Job = JobSpec["job"];
type Run = Job["run"];

function updateJob(update: (j: Job) => Job) {
  return (state: JobSpec) => ({ ...state, job: update(state.job) });
}
function updateRun(update: (r: Run) => Run) {
  return updateJob((job) => ({ ...job, run: update(job.run) }));
}
function updateEnv(update: (e: EnvModel) => EnvModel) {
  return updateRun((run) => ({ ...run, env: update(run.env || []) }));
}

const env = {
  [JobFormActionType.AddArrayItem]: (_: string, state: JobSpec) =>
    updateEnv((env) => env.concat([["", ""]]))(state),

  [JobFormActionType.RemoveArrayItem]: (index: number, state: JobSpec) =>
    updateEnv((env) => [...env.slice(0, index), ...env.slice(index + 1)])(
      state
    ),

  [JobFormActionType.Set]: (
    value: string,
    state: JobSpec,
    [col, row]: string[]
  ) =>
    updateEnv((env) => {
      env[parseInt(row, 10)][parseInt(col, 10)] = value;
      return env;
    })(state),
};
export { env };
