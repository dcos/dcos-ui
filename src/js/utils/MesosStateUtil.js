import ExecutorTypes from "../constants/ExecutorTypes";
import PodInstanceState
  from "../../../plugins/services/src/js/constants/PodInstanceState";
import Util from "./Util";

const RESOURCE_KEYS = ["cpus", "disk", "mem"];

// Based on the regex that marathon uses to validate task IDs,
// but keeping only the 'instance-' prefix, that refers to pods.
// The 'marathon-' prefix is used for task launched because of an AppDefinition.
//
// https://github.com/mesosphere/marathon/blob/feature/pods/src/main/scala/mesosphere/marathon/core/task/Task.scala#L134
const POD_TASK_REGEX = /^(.+)\.instance-([^_.]+)[._]([^_.]+)$/;

function setIsStartedByMarathonFlag(name, tasks) {
  return tasks.map(function(task) {
    return Object.assign({ isStartedByMarathon: name === "marathon" }, task);
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
    const newState = Object.assign({}, state);

    newState.frameworks = state.frameworks.map(function(framework) {
      const { tasks = [], completed_tasks = [], name } = framework;

      return Object.assign({}, framework, {
        tasks: setIsStartedByMarathonFlag(name, tasks),
        completed_tasks: setIsStartedByMarathonFlag(name, completed_tasks)
      });
    });

    return newState;
  },

  /**
   * @param {{frameworks:array,completed_frameworks:array}} state
   * @param {string} frameworkID
   * @returns {{executors:Array, completed_executors:Array}|null} framework
   */
  getFramework(state, frameworkID) {
    const { frameworks, completed_frameworks } = state;

    return []
      .concat(frameworks, completed_frameworks)
      .find(function(framework) {
        return framework != null && framework.id === frameworkID;
      });
  },

  /**
   * @param  {Object} state A document of mesos state
   * @param  {Array} filter Allows us to filter by framework id
   *   All other frameworks will be put into an 'other' category
   * @returns {Object} A map of frameworks running on host
   */
  getHostResourcesByFramework(state, filter = []) {
    return state.frameworks.reduce(function(memo, framework) {
      framework.tasks.forEach(function(task) {
        if (memo[task.slave_id] == null) {
          memo[task.slave_id] = {};
        }

        var frameworkKey = task.framework_id;
        if (filter.includes(framework.id)) {
          frameworkKey = "other";
        }

        const resources = task.resources;
        if (memo[task.slave_id][frameworkKey] == null) {
          memo[task.slave_id][frameworkKey] = resources;
        } else {
          // Aggregates used resources from each executor
          RESOURCE_KEYS.forEach(function(key) {
            memo[task.slave_id][frameworkKey][key] += resources[key];
          });
        }
      });

      return memo;
    }, {});
  },

  getTasksFromVirtualNetworkName(state = {}, overlayName) {
    const frameworks = state.frameworks || [];

    return frameworks.reduce(function(memo, framework) {
      const tasks = framework.tasks || [];

      return memo.concat(
        tasks.filter(function(task) {
          const appPath = "container.network_infos.0.name";
          const podPath = "statuses.0.container_status.network_infos.0.name";

          return (
            Util.findNestedPropertyInObject(task, appPath) === overlayName ||
            Util.findNestedPropertyInObject(task, podPath) === overlayName
          );
        })
      );
    }, []);
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
    const frameworks = state.frameworks || [];
    const marathonFramework = frameworks.find(function(framework) {
      return framework.name === "marathon";
    });

    if (!marathonFramework) {
      return [];
    }

    const instancesMap = marathonFramework.completed_tasks.reduce(function(
      memo,
      task
    ) {
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
          const lastStatus = task.statuses.reduce(function(memo, status) {
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

  /**
   * @param {{frameworks:array, completed_frameworks:array}} state
   * @param {{id:string, executor_id:string, framework_id:string}} task
   * @param {string} path
   * @returns {string} task path
   */
  getTaskPath(state, task, path = "") {
    const {
      id: taskID,
      framework_id: frameworkID,
      executor_id: executorID
    } = task;
    const framework = MesosStateUtil.getFramework(state, frameworkID);
    if (state == null || task == null || framework == null) {
      return "";
    }

    let taskPath = "";
    // Find matching executor or task to construct the task path
    []
      .concat(framework.executors, framework.completed_executors)
      .every(function(executor) {
        if (executor.id === executorID || executor.id === taskID) {
          // Use the executor task path construct if it's a "pod" / TaskGroup
          // executor (type: DEFAULT), otherwise fallback to the default
          // app/framework behavior.
          if (executor.type === ExecutorTypes.DEFAULT) {
            // For a detail documentation on how to construct the task path
            // please see: https://reviews.apache.org/r/52376/
            taskPath = `${executor.directory}/tasks/${taskID}/${path}`;

            return false;
          }

          // Simply use the executors directory for "apps" and "frameworks",
          // as well as any other executor
          taskPath = `${executor.directory}/${path}`;

          return false;
        }

        return true;
      });

    return taskPath;
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
  }
};

module.exports = MesosStateUtil;
