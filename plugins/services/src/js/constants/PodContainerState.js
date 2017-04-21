/**
 * The possible values of ContainerState enum for Pods, according to:
 * https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/podStatus.raml#L36
 *
 * TODO: Note that the SPEC currently states that this is not yet well-defined,
 *       the current values are assumed to be correct (DCOS-9852).
 */
module.exports = {
  STAGING: "TASK_STAGING",
  STARTING: "TASK_STARTING",
  STARTED: "TASK_STARTED",
  RUNNING: "TASK_RUNNING",
  KILLING: "TASK_KILLING",
  FINISHED: "TASK_FINISHED",
  KILLED: "TASK_KILLED",
  FAILED: "TASK_FAILED",
  LOST: "TASK_LOST",
  ERROR: "TASK_ERROR"
};
