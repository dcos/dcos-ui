import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import StructUtil from "#SRC/js/utils/StructUtil";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";

import PodInstanceState
  from "../../../plugins/services/src/js/constants/PodInstanceState";
import Util from "./Util";

const RESOURCE_KEYS = ["cpus", "disk", "mem"];

const COMPLETED_TASK_STATES = Object.keys(TaskStates).filter(function(
  taskState
) {
  return TaskStates[taskState].stateTypes.includes("completed");
});

// Based on the regex that marathon uses to validate task IDs,
// but keeping only the 'instance-' prefix, that refers to pods.
// The 'marathon-' prefix is used for task launched because of an AppDefinition.
//
// https://github.com/mesosphere/marathon/blob/feature/pods/src/main/scala/mesosphere/marathon/core/task/Task.scala#L134
const POD_TASK_REGEX = /^(.+)\.instance-([^_.]+)[._]([^_.]+)$/;

function setIsStartedByMarathonFlag(marathon_id, tasks) {
  return tasks.map(function(task) {
    return Object.assign(
      { isStartedByMarathon: marathon_id === task.framework_id },
      task
    );
  });
}

const MesosStateUtil = {
  /**
   * De-compose the given task id into it's primitive components
   *
   * @param {String} taskID - The task ID to decompose
   * @returns {{podID, instanceID}} Returns the ID components
   */
  decomposePodTaskId(taskID) {
    const [, podID, instanceID, taskName] = POD_TASK_REGEX.exec(taskID);

    return {
      podID,
      instanceID,
      taskName
    };
  },

  flagMarathonTasks(state) {
    if (!state.frameworks) {
      return state;
    }

    const marathon = state.frameworks.find(
      framework => framework.name === "marathon"
    );

    if (!marathon) {
      return state;
    }

    const { tasks = [] } = state;

    return Object.assign(state, {
      tasks: setIsStartedByMarathonFlag(marathon.id, tasks)
    });
  },

  /**
   * @param {{frameworks:array,completed_frameworks:array}} state
   * @param {string} frameworkID
   * @returns {{executors:Array, completed_executors:Array}|null} framework
   */
  getFramework(state, frameworkID) {
    const { frameworks, completed_frameworks = [] } = state;

    return []
      .concat(frameworks, completed_frameworks)
      .find(function(framework) {
        return framework != null && framework.id === frameworkID;
      });
  },

  /**
   * Returns resource usage of non completed tasks grouped by Host and Framework
   *
   * @param  {Object} state A document of mesos state
   * @param  {Array} filter Allows us to filter by framework id
   *   All other frameworks will be put into an 'other' category
   * @returns {Object} A map of frameworks running on host
   */
  getHostResourcesByFramework(state, filter = []) {
    return (state.tasks || [])
      .filter(task => !COMPLETED_TASK_STATES.includes(task.state))
      .reduce(function(memo, task) {
        if (memo[task.slave_id] == null) {
          memo[task.slave_id] = {};
        }

        let frameworkKey = task.framework_id;
        if (filter.includes(frameworkKey)) {
          frameworkKey = "other";
        }

        const resources = task.resources;
        if (memo[task.slave_id][frameworkKey] == null) {
          memo[task.slave_id][frameworkKey] = StructUtil.copyRawObject(
            resources
          );
        } else {
          // Aggregates used resources from each executor
          RESOURCE_KEYS.forEach(function(key) {
            memo[task.slave_id][frameworkKey][key] += resources[key];
          });
        }

        return memo;
      }, {});
  },

  getRunningTasksFromVirtualNetworkName({ tasks = [] } = {}, overlayName) {
    return tasks.filter(function(task) {
      const appPath = "container.network_infos.0.name";
      const podPath = "statuses.0.container_status.network_infos.0.name";

      return (
        TaskStates[task.state].stateTypes.includes("active") &&
        (Util.findNestedPropertyInObject(task, appPath) === overlayName ||
          Util.findNestedPropertyInObject(task, podPath) === overlayName)
      );
    });
  },

  /**
   * Return historical instances (killed, terminated, failed etc.) for the given
   * pod by digging into the marathon state.
   *
   * @param {Object} state - The mesos state response
   * @param {Pod} pod - The related pod
   * @returns {Array} The array of historical instances
   */
  getPodHistoricalInstances(state, pod) {
    const { frameworks = [], tasks = [] } = state;
    const marathon = frameworks.find(function(framework) {
      return framework.name === "marathon";
    });

    if (!marathon) {
      return [];
    }

    const instancesMap = tasks
      .filter(
        task =>
          task.framework_id === marathon.id &&
          COMPLETED_TASK_STATES.includes(task.state)
      )
      .reduce(function(memo, task) {
        if (MesosStateUtil.isPodTaskId(task.id)) {
          const { podID, instanceID } = MesosStateUtil.decomposePodTaskId(
            task.id
          );
          if (podID === pod.getMesosId()) {
            const fullInstanceID = `${podID}.instance-${instanceID}`;
            let containerArray = memo[fullInstanceID];
            if (containerArray === undefined) {
              containerArray = memo[fullInstanceID] = [];
            }

            // The last status can give us information about the time the
            // container was last updated, so we need the latest status item
            const lastStatus = (task.statuses || [])
              .reduce(function(memo, status) {
                if (!memo || status.timestamp > memo.timestamp) {
                  return status;
                }

                return memo;
              }, null);

            // Add additional fields to the task structure in order to make it
            // as close as possible to something a PodContainer will understand.
            containerArray.push(
              Object.assign(
                {
                  containerId: task.id,
                  status: task.state,
                  //
                  // NOTE: We are creating a Date object from this value, so we
                  //       should be OK with the timestamp
                  //
                  lastChanged: lastStatus.timestamp * 1000,
                  lastUpdated: lastStatus.timestamp * 1000
                },
                task
              )
            );
          }
        }

        return memo;
      }, {});

    // Try to compose actual PodInstance structures from the information we
    // have so far. Obviously we don't have any details, but we can populate
    // most of the UI-interesting fields by summarizing container details
    return Object.keys(instancesMap).map(function(instanceID) {
      const containers = instancesMap[instanceID];
      const summaryProperties = containers.reduce(
        function(memo, instance) {
          const { resources = {}, lastChanged = 0 } = instance;

          memo.resources.cpus += resources.cpus || 0;
          memo.resources.mem += resources.mem || 0;
          memo.resources.gpus += resources.gpus || 0;
          memo.resources.disk += resources.disk || 0;

          // TODO: Currently both lastChanged and lastUpdated are pointing to the
          //       same timestamp. Is there any way to get more information?
          if (lastChanged > memo.lastChanged) {
            memo.lastChanged = lastChanged;
            memo.lastUpdated = lastChanged;
          }

          return memo;
        },
        {
          resources: { cpus: 0, mem: 0, gpus: 0, disk: 0 },
          lastChanged: 0,
          lastUpdated: 0
        }
      );

      // Compose something as close as possible to what `PodInstance` understand
      return Object.assign(
        {
          id: instanceID,
          status: PodInstanceState.TERMINAL,
          containers
        },
        summaryProperties
      );
    });
  },

  getTaskContainerID(task) {
    let container = Util.findNestedPropertyInObject(
      task,
      "statuses.0.container_status.container_id"
    );

    if (!container || !container.value) {
      return null;
    }

    const containerIDs = [];
    while (container) {
      containerIDs.push(container.value);
      container = container.parent;
    }

    return containerIDs.reverse().join(".");
  },

  /**
   * Check if the given string looks like a pod task ID
   *
   * @param {String} taskID - The task ID to test
   * @returns {Boolean} Returns true if the function passes the test
   */
  isPodTaskId(taskID) {
    return POD_TASK_REGEX.test(taskID);
  },

  /**
   * Assigns a property to task if it is a scheduler task.
   * @param  {Object} task
   * @param  {Array} schedulerTasks Array of scheduler task
   * @return {Object} task
   */
  assignSchedulerTaskField(task, schedulerTasks) {
    if (schedulerTasks.some(({ id }) => task.id === id)) {
      return Object.assign({}, task, { schedulerTask: true });
    }

    return task;
  },

  /**
   * Assigns a property to task if it belongs to an SDK service.
   * @param  {Object} task
   * @param  {Array} service task belongs to
   * @return {Object} task
   */
  flagSDKTask(task, service) {
    if (isSDKService(service) && task.sdkTask === undefined) {
      return Object.assign({}, task, { sdkTask: true });
    }

    return task;
  },

  indexTasksByID(state) {
    const { tasks = [] } = state;

    return tasks.reduce((acc, task) => {
      acc[task.id] = task;

      return acc;
    }, {});
  }
};

module.exports = MesosStateUtil;
