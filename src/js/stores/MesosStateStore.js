import PluginSDK from "PluginSDK";
import throttle from "lodash.throttle";

import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import AppDispatcher from "../events/AppDispatcher";
import ActionTypes from "../constants/ActionTypes";
import CompositeState from "../structs/CompositeState";
import Config from "../config/Config";
import DCOSStore from "./DCOSStore";
import Framework from "../../../plugins/services/src/js/structs/Framework";
import GetSetBaseStore from "./GetSetBaseStore";
import {
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,
  VISIBILITY_CHANGE
} from "../constants/EventTypes";
import MesosStateActions from "../events/MesosStateActions";
import MesosStateUtil from "../utils/MesosStateUtil";
import Task from "../../../plugins/services/src/js/structs/Task";
import VisibilityStore from "./VisibilityStore";

let isPolling = false;

const throttledFetchState = throttle(
  MesosStateActions.fetchState,
  Config.getRefreshRate()
);

function poll() {
  if (!isPolling) {
    isPolling = true;
  }
  throttledFetchState();
}

function stopPolling() {
  if (isPolling) {
    throttledFetchState.cancel();
    isPolling = false;
  }
}

/**
 * Assigns a property to task if it is a scheduler task.
 * @param  {Object} task
 * @param  {Object} schedulerTasksMap Map of scheduler task
 * @return {Object} task
 */
function assignSchedulerTaskField(task, schedulerTasksMap) {
  if (schedulerTasksMap[task.id] == null) {
    return task;
  }

  return { ...task, schedulerTask: true };
}

/**
 * Assigns a property to task if it belongs to an SDK service.
 * @param  {Object} task
 * @param  {Array} service task belongs to
 * @return {Object} task
 */
function flagSDKTask(task, service) {
  if (isSDKService(service) && task.sdkTask === undefined) {
    return Object.assign({}, task, { sdkTask: true });
  }

  return task;
}

class MesosStateStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      lastMesosState: {},
      taskCache: {}
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: MESOS_STATE_CHANGE,
        error: MESOS_STATE_REQUEST_ERROR
      },
      unmountWhen(store, event) {
        if (event === "success") {
          return Object.keys(store.get("lastMesosState")).length;
        }
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== ActionTypes.SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case ActionTypes.REQUEST_MESOS_STATE_SUCCESS:
          this.processStateSuccess(action.data);
          break;
        case ActionTypes.REQUEST_MESOS_STATE_ERROR:
          this.processStateError(action.xhr);
          break;
        case ActionTypes.REQUEST_MESOS_STATE_ONGOING:
          this.processOngoingRequest();
          break;
      }

      if (
        this.shouldPoll() &&
        (action.type === ActionTypes.REQUEST_MESOS_STATE_SUCCESS ||
          action.type === ActionTypes.REQUEST_MESOS_STATE_ERROR ||
          action.type === ActionTypes.REQUEST_MESOS_STATE_ONGOING)
      ) {
        poll();
      }

      return true;
    });

    VisibilityStore.addChangeListener(
      VISIBILITY_CHANGE,
      this.onVisibilityStoreChange.bind(this)
    );
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);

    if (this.shouldPoll()) {
      poll();
    }
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  }

  onVisibilityStoreChange() {
    if (!VisibilityStore.isInactive() && this.shouldPoll()) {
      poll();

      return;
    }

    stopPolling();
  }

  shouldPoll() {
    return this.listeners(MESOS_STATE_CHANGE).length > 0;
  }

  indexTasksByID(lastMesosState) {
    const taskIndex = {};

    lastMesosState.frameworks.forEach(function(service) {
      const {
        tasks = [],
        completed_tasks = [],
        unreachable_tasks = []
      } = service;

      tasks.concat(completed_tasks, unreachable_tasks).forEach(function(task) {
        taskIndex[task.id] = task;
      });
    });

    return taskIndex;
  }

  getHostResourcesByFramework(filter) {
    return MesosStateUtil.getHostResourcesByFramework(
      this.get("lastMesosState"),
      filter
    );
  }

  getPodHistoricalInstances(pod) {
    return MesosStateUtil.getPodHistoricalInstances(
      this.get("lastMesosState"),
      pod
    );
  }

  getServiceFromName(name) {
    const services = this.get("lastMesosState").frameworks;

    if (services) {
      return services.find(function(service) {
        return service.name === name;
      });
    }

    return null;
  }

  getNodeFromID(id) {
    const nodes = this.get("lastMesosState").slaves;

    if (nodes) {
      return nodes.find(function(node) {
        return node.id === id;
      });
    }

    return null;
  }

  getNodeFromHostname(hostname) {
    const nodes = this.get("lastMesosState").slaves;

    if (nodes) {
      return nodes.find(function(node) {
        return node.hostname === hostname;
      });
    }

    return null;
  }

  getTasksFromNodeID(nodeID) {
    const frameworks = this.get("lastMesosState").frameworks || [];
    const memberTasks = {};

    frameworks.forEach(framework => {
      framework.tasks.forEach(function(task) {
        if (task.slave_id === nodeID) {
          // Need to get service from Marathon because we need the labels.
          const service = DCOSStore.serviceTree.findItem(function(item) {
            return (
              item instanceof Framework &&
              item.getFrameworkName() === framework.name
            );
          });
          task = flagSDKTask(task, service);
          memberTasks[task.id] = task;
        }
      });
      framework.completed_tasks.forEach(function(task) {
        if (task.slave_id === nodeID) {
          memberTasks[task.id] = task;
        }
      });
    });

    return Object.values(memberTasks);
  }

  getTaskFromTaskID(taskID) {
    const taskCache = this.get("taskCache");
    const foundTask = taskCache[taskID];
    if (foundTask == null) {
      return null;
    }

    return new Task(foundTask);
  }

  /**
   * @param  {Array} frameworks
   * @return {Array} list of scheduler tasks
   */
  getSchedulerTasks(frameworks) {
    const tasks = this.getTasksFromServiceName("marathon", frameworks);

    return tasks.filter(function({ labels }) {
      if (!labels) {
        return false;
      }

      return labels.some(({ key }) => key === "DCOS_PACKAGE_FRAMEWORK_NAME");
    });
  }

  getSchedulerTasksMap(frameworks) {
    return this.getSchedulerTasks(frameworks).reduce(
      (acc, { id, ...rest }) => ({ [id]: rest, ...acc }),
      {}
    );
  }

  getTasksFromServiceName(serviceName, frameworks = []) {
    const framework = frameworks.find(function(framework) {
      return framework.name === serviceName;
    });

    if (framework) {
      const activeTasks = framework.tasks || [];
      const completedTasks = framework.completed_tasks || [];
      const unreachableTasks = framework.unreachable_tasks || [];

      return activeTasks.concat(completedTasks, unreachableTasks);
    }

    return [];
  }

  getTasksByService(service) {
    const frameworks = this.get("lastMesosState").frameworks;
    const serviceName = service.getName();

    // Convert serviceId to Mesos task name
    const mesosTaskName = service.getMesosId();

    if (!serviceName || !mesosTaskName || !frameworks) {
      return [];
    }

    const serviceIsFramework = service && service instanceof Framework;
    const serviceFrameworkName = serviceIsFramework
      ? service.getFrameworkName()
      : serviceName;

    // Combine framework (if matching framework was found) and filtered
    // Marathon tasks. This will give you a list of framework tasks including
    // the scheduler tasks or a list of Marathon application tasks.
    return frameworks.reduce(function(serviceTasks, framework) {
      const {
        tasks = [],
        completed_tasks = [],
        unreachable_tasks = [],
        name
      } = framework;
      // Include tasks from framework match, if service is a Framework
      if (serviceIsFramework && serviceFrameworkName === name) {
        return serviceTasks
          .concat(tasks, completed_tasks)
          .map(task => flagSDKTask(task, service));
      }

      // Filter marathon tasks by service name
      if (name === "marathon") {
        return tasks
          .concat(completed_tasks, unreachable_tasks)
          .filter(({ name }) => name === mesosTaskName)
          .concat(serviceTasks)
          .map(task => flagSDKTask(task, service));
      }

      return serviceTasks;
    }, []);
  }

  getTasksFromVirtualNetworkName(overlayName) {
    return MesosStateUtil.getTasksFromVirtualNetworkName(
      this.get("lastMesosState"),
      overlayName
    );
  }

  processStateSuccess(lastMesosState) {
    const schedulerTasksMap = this.getSchedulerTasksMap(
      lastMesosState.frameworks
    );

    lastMesosState.frameworks = lastMesosState.frameworks.reduce(
      (acc, framework) => {
        const tasks = (framework.tasks || [])
          .map(task => assignSchedulerTaskField(task, schedulerTasksMap));
        const completed_tasks = (framework.completed_tasks || [])
          .map(task => assignSchedulerTaskField(task, schedulerTasksMap));
        const unreachable_tasks = (framework.unreachable_tasks || [])
          .map(task => assignSchedulerTaskField(task, schedulerTasksMap));

        return acc.concat({
          ...framework,
          tasks,
          completed_tasks,
          unreachable_tasks
        });
      },
      []
    );

    CompositeState.addState(lastMesosState);
    const taskCache = this.indexTasksByID(lastMesosState);
    this.set({ lastMesosState, taskCache });
    this.emit(MESOS_STATE_CHANGE);
  }

  processStateError(xhr) {
    this.emit(MESOS_STATE_REQUEST_ERROR, xhr);
  }

  processOngoingRequest() {
    // Handle ongoing request here.
  }

  get storeID() {
    return "state";
  }
}

module.exports = new MesosStateStore();
