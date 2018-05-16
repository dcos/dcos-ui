import DCOSStore from "#SRC/js/stores/DCOSStore";
import CompositeState from "#SRC/js/structs/CompositeState";

import TaskHealthStates from "../constants/TaskHealthStates";

function getTaskHealthFromMesos(task) {
  if (task.statuses == null) {
    return null;
  }

  const healths = task.statuses.map(function(status) {
    return status.healthy;
  });

  const healthDataExists =
    healths.length > 0 &&
    healths.every(function(health) {
      return typeof health !== "undefined";
    });

  if (healthDataExists) {
    return healths.some(function(health) {
      return health;
    });
  }

  return null;
}

function getTaskHealthFromMarathon(task, taskLookupTable) {
  const marathonTask = taskLookupTable[task.id];

  if (marathonTask != null) {
    const { healthCheckResults } = marathonTask;

    if (healthCheckResults != null && healthCheckResults.length > 0) {
      return healthCheckResults.every(function(result) {
        return result.alive;
      });
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

function mergeHostname(task) {
  const node = CompositeState.getNodesList()
    .filter({
      ids: [task.slave_id]
    })
    .last();

  if (node) {
    task.hostname = node.hostname;
  }

  return task;
}

function mergeData(task, taskLookupTable) {
  // Merge version from Marathon
  task = mergeVersion(task, taskLookupTable);
  // Get Health from Mesos first, and fallback on Marathon
  task = mergeHealth(task, taskLookupTable);
  // Merge hostname if we can find it
  task = mergeHostname(task);

  return task;
}

function mergeTaskData(tasks) {
  return tasks.map(task => mergeData(task, DCOSStore.taskLookupTable));
}

module.exports = {
  mergeTaskData
};
