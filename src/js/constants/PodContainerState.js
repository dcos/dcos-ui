//
// The possible values of ContainerState enum for Pods, according to:
// https://github.com/mesosphere/marathon/blob/feature/pods/docs/docs/rest-api/public/api/v2/types/podStatus.raml#L36
//
// TODO: Note that the SPEC currently states that this is not yet well-defiend,
//       the current values are assumed to be correct (DCOS-9852).
//
module.exports = {
  RUNNING: 'TASK_RUNNING',
  ERROR: 'TASK_ERROR',
  FAILED: 'TASK_FAILED',
  FINISHED: 'TASK_FINISHED',
  KILLED: 'TASK_KILLED'
};
