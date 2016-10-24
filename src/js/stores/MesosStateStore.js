import PluginSDK from 'PluginSDK';

import AppDispatcher from '../events/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import CompositeState from '../structs/CompositeState';
import Config from '../config/Config';
import Framework from '../../../plugins/services/src/js/structs/Framework';
import GetSetBaseStore from './GetSetBaseStore';
import {
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
import MesosStateActions from '../events/MesosStateActions';
import MesosStateUtil from '../utils/MesosStateUtil';
import Task from '../../../plugins/services/src/js/structs/Task';
import VisibilityStore from './VisibilityStore';

var requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    MesosStateActions.fetchState();
    requestInterval = setInterval(
      MesosStateActions.fetchState, Config.getRefreshRate()
    );
  }
}

function stopPolling() {
  if (requestInterval != null) {
    clearInterval(requestInterval);
    requestInterval = null;
  }
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
        if (event === 'success') {
          return Object.keys(store.get('lastMesosState')).length;
        }
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== ActionTypes.SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case ActionTypes.REQUEST_MESOS_STATE_SUCCESS:
          this.processStateSuccess(action.data);
          break;
        case ActionTypes.REQUEST_MESOS_STATE_ERROR:
          this.processStateError();
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
    return !!this.listeners(MESOS_STATE_CHANGE).length;
  }

  indexTasksByID(lastMesosState) {
    let taskIndex = {};

    lastMesosState.frameworks.forEach(function (service) {
      let tasks = service.tasks.concat(service.completed_tasks);
      tasks.forEach(function (task) {
        taskIndex[task.id] = task;
      });
    });

    return taskIndex;
  }

  getHostResourcesByFramework(filter) {
    return MesosStateUtil.getHostResourcesByFramework(
      this.get('lastMesosState'), filter
    );
  }

  getPodHistoricalInstances(pod) {
    return MesosStateUtil.getPodHistoricalInstances(
      this.get('lastMesosState'), pod
    );
  }

  getServiceFromName(name) {
    let services = this.get('lastMesosState').frameworks;

    if (services) {
      return services.find(function (service) {
        return service.name === name;
      });
    }

    return null;
  }

  getNodeFromID(id) {
    let nodes = this.get('lastMesosState').slaves;

    if (nodes) {
      return nodes.find(function (node) {
        return node.id === id;
      });
    }

    return null;
  }

  getNodeFromHostname(hostname) {
    let nodes = this.get('lastMesosState').slaves;

    if (nodes) {
      return nodes.find(function (node) {
        return node.hostname === hostname;
      });
    }

    return null;
  }

  getTasksFromNodeID(nodeID) {
    let services = this.get('lastMesosState').frameworks || [];
    let memberTasks = {};

    services.forEach(function (service) {
      service.tasks.forEach(function (task) {
        if (task.slave_id === nodeID) {
          memberTasks[task.id] = task;
        }
      });
      service.completed_tasks.forEach(function (task) {
        if (task.slave_id === nodeID) {
          memberTasks[task.id] = task;
        }
      });
    });

    return Object.values(memberTasks);
  }

  getTaskFromTaskID(taskID) {
    let taskCache = this.get('taskCache');
    let foundTask = taskCache[taskID];
    if (foundTask == null) {
      return null;
    }
    return new Task(foundTask);
  }

  getSchedulerTaskFromServiceName(serviceName) {
    let frameworks = this.get('lastMesosState').frameworks;

    if (!frameworks) {
      return null;
    }

    let framework = frameworks.find(function (framework) {
      return framework.name.toLowerCase() === 'marathon';
    });

    if (!framework || !framework.tasks) {
      return null;
    }

    let result = framework.tasks.find(function (task) {
      let labels = task.labels;

      if (!labels) {
        return false;
      }

      let frameworkName = labels.find(function (label) {
        return label.key === 'DCOS_PACKAGE_FRAMEWORK_NAME';
      });

      return frameworkName && frameworkName.value === serviceName;
    });

    return result;
  }

  getTasksFromServiceName(serviceName) {
    let frameworks = this.get('lastMesosState').frameworks;

    if (!frameworks) {
      return null;
    }

    let framework = frameworks.find(function (framework) {
      return framework.name === serviceName;
    });

    if (framework) {
      let activeTasks = framework.tasks || [];
      let completedTasks = framework.completed_tasks || [];

      return activeTasks.concat(completedTasks);
    }

    return [];
  }

  getTasksByService(service) {
    let frameworks = this.get('lastMesosState').frameworks;
    let serviceName = service.getName();

    // Convert serviceId to Mesos task name
    let mesosTaskName = service.getMesosId();

    if (!serviceName || !mesosTaskName || !frameworks) {
      return [];
    }

    // Combine framework (if matching framework was found) and filtered
    // Marathon tasks. This will give you a list of framework tasks including
    // the scheduler tasks or a list of Marathon application tasks.
    return frameworks.reduce(function (serviceTasks, framework) {
      let {tasks = [], completed_tasks = {}, name} = framework;
      // Include tasks from framework match, if service is a Framework
      if (service instanceof Framework && name === serviceName) {
        return serviceTasks.concat(tasks, completed_tasks);
      }

      // Filter marathon tasks by service name
      if (name === 'marathon') {
        return tasks.concat(completed_tasks)
          .filter(function ({name}) {
            return name === mesosTaskName;
          }).concat(serviceTasks);
      }

      return serviceTasks;
    }, []);
  }

  getTasksFromVirtualNetworkName(overlayName) {
    return MesosStateUtil.getTasksFromVirtualNetworkName(
      this.get('lastMesosState'),
      overlayName
    );
  }

  processStateSuccess(lastMesosState) {
    CompositeState.addState(lastMesosState);
    let taskCache = this.indexTasksByID(lastMesosState);
    this.set({lastMesosState, taskCache});
    this.emit(MESOS_STATE_CHANGE);
  }

  processStateError() {
    this.emit(MESOS_STATE_REQUEST_ERROR);
  }

  processOngoingRequest() {
    // Handle ongoing request here.
  }

  get storeID() {
    return 'state';
  }

}

module.exports = new MesosStateStore();
