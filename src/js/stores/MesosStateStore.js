import PluginSDK from "PluginSDK";

import AppDispatcher from "../events/AppDispatcher";
import ActionTypes from "../constants/ActionTypes";
import CompositeState from "../structs/CompositeState";
import Config from "../config/Config";
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

var requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    MesosStateActions.fetchState();
    requestInterval = setInterval(
      MesosStateActions.fetchState,
      Config.getRefreshRate()
    );
  }
}

function stopPolling() {
  if (requestInterval != null) {
    clearInterval(requestInterval);
    requestInterval = null;
  }
}

/**
 * Assigns a property to task if it is a scheduler task.
 * @param  {Object} task
 * @param  {Array} schedulerTasks Array of scheduler task
 * @return {Object} task
 */
function assignSchedulerTaskField(task, schedulerTasks) {
  if (schedulerTasks.some(({ id }) => task.id === id)) {
    return Object.assign({}, task, { schedulerTask: true });
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
      startPolling();
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
      startPolling();

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
      const tasks = service.tasks.concat(service.completed_tasks);
      tasks.forEach(function(task) {
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
    const services = this.get("lastMesosState").frameworks || [];
    const memberTasks = {};

    const schedulerTasks = this.getSchedulerTasks();

    services.forEach(service => {
      service.tasks.forEach(function(task) {
        if (task.slave_id === nodeID) {
          memberTasks[task.id] = assignSchedulerTaskField(task, schedulerTasks);
        }
      });
      service.completed_tasks.forEach(function(task) {
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
   * @return {Array} list of scheduler tasks
   */
  getSchedulerTasks() {
    const tasks = this.getTasksFromServiceName("marathon");

    return tasks.filter(function({ labels }) {
      if (!labels) {
        return false;
      }

      return labels.some(({ key }) => key === "DCOS_PACKAGE_FRAMEWORK_NAME");
    });
  }

  getSchedulerTaskFromServiceName(serviceName) {
    const tasks = this.getSchedulerTasks();

    return tasks.find(function({ labels }) {
      return labels.some(({ key, value }) => {
        return key === "DCOS_PACKAGE_FRAMEWORK_NAME" && value === serviceName;
      });
    });
  }

  getTasksFromServiceName(serviceName) {
    const frameworks = this.get("lastMesosState").frameworks;

    if (!frameworks) {
      return null;
    }

    const framework = frameworks.find(function(framework) {
      return framework.name === serviceName;
    });

    if (framework) {
      const activeTasks = framework.tasks || [];
      const completedTasks = framework.completed_tasks || [];

      return activeTasks.concat(completedTasks);
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

    const schedulerTasks = this.getSchedulerTasks();

    // Combine framework (if matching framework was found) and filtered
    // Marathon tasks. This will give you a list of framework tasks including
    // the scheduler tasks or a list of Marathon application tasks.
    return frameworks.reduce(function(serviceTasks, framework) {
      const { tasks = [], completed_tasks = {}, name } = framework;
      // Include tasks from framework match, if service is a Framework
      if (service instanceof Framework && name === serviceName) {
        return serviceTasks
          .concat(tasks, completed_tasks)
          .map(task => assignSchedulerTaskField(task, schedulerTasks));
      }

      // Filter marathon tasks by service name
      if (name === "marathon") {
        return tasks
          .concat(completed_tasks)
          .filter(({ name }) => name === mesosTaskName)
          .concat(serviceTasks)
          .map(task => assignSchedulerTaskField(task, schedulerTasks));
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
