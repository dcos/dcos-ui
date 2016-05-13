import {Store} from 'mesosphere-shared-reactjs';

var AppDispatcher = require('../events/AppDispatcher');
import ActionTypes from '../constants/ActionTypes';
import CompositeState from '../structs/CompositeState';
var Config = require('../config/Config');
import {
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
var GetSetMixin = require('../mixins/GetSetMixin');
var MesosStateActions = require('../events/MesosStateActions');
var MesosStateUtil = require('../utils/MesosStateUtil');
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

function handleInactiveChange() {
  let isInactive = VisibilityStore.get('isInactive');
  if (isInactive) {
    stopPolling();
  }

  if (!isInactive && MesosStateStore.shouldPoll()) {
    startPolling();
  }
}

VisibilityStore.addChangeListener(VISIBILITY_CHANGE, handleInactiveChange);

var MesosStateStore = Store.createStore({
  storeID: 'state',

  mixins: [GetSetMixin],

  getSet_data: {
    lastMesosState: {}
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);

    if (this.shouldPoll()) {
      startPolling();
    }
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  },

  shouldPoll: function () {
    return !!this.listeners(MESOS_STATE_CHANGE).length;
  },

  getHostResourcesByFramework: function (filter) {
    return MesosStateUtil.getHostResourcesByFramework(
      MesosStateStore.get('lastMesosState'), filter
    );
  },

  getServiceFromName: function (name) {
    let services = this.get('lastMesosState').frameworks;

    if (services) {
      return services.find(function (service) {
        return service.name === name;
      });
    }

    return null;
  },

  getNodeFromID: function (id) {
    let nodes = this.get('lastMesosState').slaves;

    if (nodes) {
      return nodes.find(function (node) {
        return node.id === id;
      });
    }

    return null;
  },

  getTasksFromNodeID: function (nodeID) {
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
  },

  getTaskFromTaskID: function (taskID) {
    let services = this.get('lastMesosState').frameworks;
    let foundTask = null;

    services.some(function (service) {
      let tasks = service.tasks.concat(service.completed_tasks);

      foundTask = tasks.find(function (task) {
        return task.id === taskID;
      });

      return foundTask;
    });

    return foundTask;
  },

  getSchedulerTaskFromServiceName: function (serviceName) {
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
  },

  getTasksFromServiceName: function (serviceName) {
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
  },

  getTasksByServiceId: function (serviceId) {
    // Convert serviceId to Mesos service name
    let mesosServiceName = serviceId.split('/').slice(1).reverse().join('.');
    let frameworks = this.get('lastMesosState').frameworks;

    if (mesosServiceName === '' || !frameworks) {
      return [];
    }

    // Combine framework (if matching framework was found) and filtered
    // Marathon tasks. This will give you a list of framework tasks including
    // the scheduler tasks or a list of Marathon application tasks.
    return frameworks.reduce(function (serviceTasks, framework) {
      let {tasks=[], completed_tasks={}, name} = framework;

      if (name === mesosServiceName) {
        return serviceTasks.concat(tasks, completed_tasks);
      }

      // Filter marathon tasks by service name
      if (name === 'marathon') {
        return tasks.concat(completed_tasks)
          .filter(function ({name}) {
            return name === mesosServiceName;
          }).concat(serviceTasks);
      }

      return serviceTasks;
    }, []);
  },

  processStateSuccess: function (lastMesosState) {
    CompositeState.addState(lastMesosState);
    this.set({lastMesosState});
    this.emit(MESOS_STATE_CHANGE);
  },

  processStateError: function () {
    this.emit(MESOS_STATE_REQUEST_ERROR);
  },

  processOngoingRequest: function () {
    // Handle ongoing request here.
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== ActionTypes.SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case ActionTypes.REQUEST_MESOS_STATE_SUCCESS:
        MesosStateStore.processStateSuccess(action.data);
        break;
      case ActionTypes.REQUEST_MESOS_STATE_ERROR:
        MesosStateStore.processStateError();
        break;
      case ActionTypes.REQUEST_MESOS_STATE_ONGOING:
        MesosStateStore.processOngoingRequest();
        break;
    }

    return true;
  })

});

module.exports = MesosStateStore;
