export const cleanJobJSON = spec =>
  cleanJSON(spec, ["activeRuns", "history", "historySummary"]);

/*
 *  List of service `_itemData` keys that don't belong to a service spec
 *  as the data is either describing the service state or from sources
 *  other than Marathon.
 *
 * @type {array.<string>}
 */
export const cleanServiceJSON = spec =>
  cleanJSON(spec, [
    "uris",
    "ports",
    "version",
    "versions",
    "versionInfo",
    "deployments",
    "queue",
    "lastTaskFailure",
    "tasks",
    "taskStats",
    "tasksHealthy",
    "tasksRunning",
    "tasksStaged",
    "tasksUnhealthy",
    "name",
    "pid",
    "used_resources",
    "offered_resources",
    "capabilities",
    "hostname",
    "webui_url",
    "active",
    "TASK_STAGING",
    "TASK_STARTING",
    "TASK_RUNNING",
    "TASK_KILLING",
    "TASK_FINISHED",
    "TASK_KILLED",
    "TASK_FAILED",
    "TASK_LOST",
    "TASK_ERROR",
    "slave_ids",
    "volumes"
  ]);

function cleanJSON(json, blacklist) {
  return Object.keys(json)
    .filter(key => !blacklist.includes(key))
    .reduce((memo, key) => {
      memo[key] = json[key];
      return memo;
    }, {});
}
