import DCOSStore from "#SRC/js/stores/DCOSStore";
import CompositeState from "#SRC/js/structs/CompositeState";

import TaskHealthStates from "../constants/TaskHealthStates";
import TaskUtil from "./TaskUtil";

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

function getTaskHealthFromMarathon(task) {
  const marathonTask = DCOSStore.serviceTree.getTaskFromTaskID(task.id);

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

function mergeHealth(task) {
  let health = TaskHealthStates.UNKNOWN;

  let taskHealth = getTaskHealthFromMesos(task);

  if (taskHealth === null) {
    taskHealth = getTaskHealthFromMarathon(task);
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

function mergeVersion(task) {
  const marathonTask = DCOSStore.serviceTree.getTaskFromTaskID(task.id);

  if (marathonTask) {
    task.version = marathonTask.version;
  }

  return task;
}

function mergeHostname(task) {
  const nodeList = CompositeState.getNodesList();

  const node = nodeList
    .filter({
      ids: [task.slave_id]
    })
    .last();

  if (node) {
    task.hostname = node.hostname;
  }

  return task;
}

function mergeRegion(task) {
  const nodeList = CompositeState.getNodesList();
  const masterNode = CompositeState.getNodeMaster();

  const node = nodeList
    .filter({
      ids: [task.slave_id]
    })
    .last();

  if (!node) {
    return task;
  }

  task.regionName = TaskUtil.getRegionName(task, node, masterNode);

  return task;
}

function mergeZone(task) {
  const nodeList = CompositeState.getNodesList();
  const masterNode = CompositeState.getNodeMaster();

  const node = nodeList
    .filter({
      ids: [task.slave_id]
    })
    .last();

  if (!node) {
    return task;
  }

  task.zoneName = TaskUtil.getZoneName(task, node, masterNode);

  return task;
}

module.exports = {
  mergeData(task) {
    // Merge version from Marathon
    task = mergeVersion(task);
    // Get Health from Mesos first, and fallback on Marathon
    task = mergeHealth(task);
    // Merge hostname if we can find it
    task = mergeHostname(task);
    task = mergeZone(task);
    task = mergeRegion(task);

    return task;
  }
};
