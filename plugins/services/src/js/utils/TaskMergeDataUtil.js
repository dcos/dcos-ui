import DCOSStore from "#SRC/js/stores/DCOSStore";

import TaskHealthStates from "../constants/TaskHealthStates";

function getTaskHealthFromMesos(task) {
  if (task.statuses == null) {
    return null;
  }

  const healths = task.statuses.map(status => status.healthy);

  const healthDataExists =
    healths.length > 0 &&
    healths.every(health => typeof health !== "undefined");

  if (healthDataExists) {
    return healths.some(health => health);
  }

  return null;
}

function getTaskHealthFromMarathon(task, taskLookupTable) {
  const marathonTask = taskLookupTable[task.id];

  if (marathonTask != null) {
    const { healthCheckResults } = marathonTask;

    if (healthCheckResults != null && healthCheckResults.length > 0) {
      return healthCheckResults.every(result => result.alive);
    }
  }

  return null;
}

function mergeHealth(task, taskLookupTable) {
  let health = TaskHealthStates.UNKNOWN;

  let taskHealth = getTaskHealthFromMesos(task);

  if (taskHealth === null) {
    taskHealth = getTaskHealthFromMarathon(task, taskLookupTable);
  }
  // task status should only reflect health if taskHealth is defined
  if (taskHealth === true) {
    health = TaskHealthStates.HEALTHY;
  }
  if (taskHealth === false) {
    health = TaskHealthStates.UNHEALTHY;
  }

  if (
    health === TaskHealthStates.UNKNOWN &&
    task.sdkTask &&
    task.state === "TASK_RUNNING"
  ) {
    health = TaskHealthStates.HEALTHY;
  }

  task.health = health;

  return task;
}

function mergeVersion(task, taskLookupTable) {
  const marathonTask = taskLookupTable[task.id];

  if (marathonTask) {
    task.version = marathonTask.version;
  }

  return task;
}

function mergeData(task, taskLookupTable) {
  // Merge version from Marathon
  task = mergeVersion(task, taskLookupTable);
  // Get Health from Mesos first, and fallback on Marathon
  task = mergeHealth(task, taskLookupTable);

  return task;
}

function mergeTaskData(tasks) {
  return tasks.map(task => mergeData(task, DCOSStore.taskLookupTable));
}

export default {
  mergeTaskData
};
