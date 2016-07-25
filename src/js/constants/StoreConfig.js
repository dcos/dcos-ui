import {
  HEALTH_UNITS_CHANGE,
  HEALTH_UNITS_ERROR,
  HEALTH_UNIT_SUCCESS,
  HEALTH_UNIT_ERROR,
  HEALTH_UNIT_NODES_SUCCESS,
  HEALTH_UNIT_NODES_ERROR,
  HEALTH_UNIT_NODE_SUCCESS,
  HEALTH_UNIT_NODE_ERROR,

  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,

  NOTIFICATION_CHANGE,

  SIDEBAR_WIDTH_CHANGE,

  TASK_DIRECTORY_CHANGE,
  TASK_DIRECTORY_ERROR,

  USER_CREATE_ERROR,
  USER_CREATE_SUCCESS,
  USER_DELETE_ERROR,
  USER_DELETE_SUCCESS,

  USERS_CHANGE,
  USERS_REQUEST_ERROR,

  VIRTUAL_NETWORKS_CHANGE,
  VIRTUAL_NETWORKS_REQUEST_ERROR,

  VISIBILITY_CHANGE
} from './EventTypes';
import MesosStateStore from '../stores/MesosStateStore';
import NotificationStore from '../stores/NotificationStore';
import SidebarStore from '../stores/SidebarStore';
import TaskDirectoryStore from '../stores/TaskDirectoryStore';
import UnitHealthStore from '../stores/UnitHealthStore';
import UserStore from '../stores/UserStore';
import UsersStore from '../stores/UsersStore';
import VirtualNetworksStore from '../stores/VirtualNetworksStore';
import VisibilityStore from '../stores/VisibilityStore';

const ListenersDescription = {
  unitHealth: {
    store: UnitHealthStore,
    events: {
      success: HEALTH_UNITS_CHANGE,
      error: HEALTH_UNITS_ERROR,
      unitSuccess: HEALTH_UNIT_SUCCESS,
      unitError: HEALTH_UNIT_ERROR,
      nodesSuccess: HEALTH_UNIT_NODES_SUCCESS,
      nodesError: HEALTH_UNIT_NODES_ERROR,
      nodeSuccess: HEALTH_UNIT_NODE_SUCCESS,
      nodeError: HEALTH_UNIT_NODE_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  sidebar: {
    store: SidebarStore,
    events: {
      widthChange: SIDEBAR_WIDTH_CHANGE
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  state: {
    store: MesosStateStore,
    events: {
      success: MESOS_STATE_CHANGE,
      error: MESOS_STATE_REQUEST_ERROR
    },
    unmountWhen: function (store, event) {
      if (event === 'success') {
        return Object.keys(store.get('lastMesosState')).length;
      }
    },
    listenAlways: true
  },

  taskDirectory: {
    store: TaskDirectoryStore,
    events: {
      success: TASK_DIRECTORY_CHANGE,
      error: TASK_DIRECTORY_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  'user': {
    store: UserStore,
    events: {
      createSuccess: USER_CREATE_SUCCESS,
      createError: USER_CREATE_ERROR,
      deleteSuccess: USER_DELETE_SUCCESS,
      deleteError: USER_DELETE_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  'users': {
    store: UsersStore,
    events: {
      success: USERS_CHANGE,
      error: USERS_REQUEST_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  virtualNetworks: {
    store: VirtualNetworksStore,
    events: {
      success: VIRTUAL_NETWORKS_CHANGE,
      error: VIRTUAL_NETWORKS_REQUEST_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  visibility: {
    store: VisibilityStore,
    events: {
      change: VISIBILITY_CHANGE
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  notification: {
    store: NotificationStore,
    events: {
      change: NOTIFICATION_CHANGE
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  }
};

module.exports = ListenersDescription;
