import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import {
  AUTH_USER_LOGIN_CHANGED,
  AUTH_USER_LOGIN_ERROR,
  AUTH_USER_LOGOUT_SUCCESS,
  AUTH_USER_LOGOUT_ERROR,

  CHRONOS_JOBS_CHANGE,
  CHRONOS_JOBS_ERROR,

  CONFIG_LOADED,
  CONFIG_ERROR,

  COSMOS_SEARCH_CHANGE,
  COSMOS_SEARCH_ERROR,
  COSMOS_LIST_CHANGE,
  COSMOS_LIST_ERROR,
  COSMOS_DESCRIBE_CHANGE,
  COSMOS_DESCRIBE_ERROR,
  COSMOS_INSTALL_SUCCESS,
  COSMOS_INSTALL_ERROR,
  COSMOS_UNINSTALL_SUCCESS,
  COSMOS_UNINSTALL_ERROR,
  COSMOS_REPOSITORIES_SUCCESS,
  COSMOS_REPOSITORIES_ERROR,
  COSMOS_REPOSITORY_ADD_SUCCESS,
  COSMOS_REPOSITORY_ADD_ERROR,
  COSMOS_REPOSITORY_DELETE_SUCCESS,
  COSMOS_REPOSITORY_DELETE_ERROR,

  HEALTH_NODE_ERROR,
  HEALTH_NODE_SUCCESS,
  HEALTH_NODE_UNITS_ERROR,
  HEALTH_NODE_UNITS_SUCCESS,
  HEALTH_NODE_UNIT_ERROR,
  HEALTH_NODE_UNIT_SUCCESS,
  HEALTH_NODES_CHANGE,
  HEALTH_NODES_ERROR,

  HEALTH_UNITS_CHANGE,
  HEALTH_UNITS_ERROR,
  HEALTH_UNIT_SUCCESS,
  HEALTH_UNIT_ERROR,
  HEALTH_UNIT_NODES_SUCCESS,
  HEALTH_UNIT_NODES_ERROR,
  HEALTH_UNIT_NODE_SUCCESS,
  HEALTH_UNIT_NODE_ERROR,

  HISTORY_CHANGE,

  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR,
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,

  MARATHON_GROUP_CREATE_ERROR,
  MARATHON_GROUP_CREATE_SUCCESS,
  MARATHON_APPS_CHANGE,
  MARATHON_APPS_ERROR,
  MARATHON_DEPLOYMENTS_CHANGE,
  MARATHON_DEPLOYMENTS_ERROR,
  MARATHON_SERVICE_CREATE_ERROR,
  MARATHON_SERVICE_CREATE_SUCCESS,

  METADATA_CHANGE,

  NOTIFICATION_CHANGE,

  DCOS_CHANGE,
  DCOS_METADATA_CHANGE,

  MESOS_LOG_CHANGE,
  MESOS_LOG_REQUEST_ERROR,

  SIDEBAR_WIDTH_CHANGE,

  TASK_DIRECTORY_CHANGE,
  TASK_DIRECTORY_ERROR,

  USER_CREATE_ERROR,
  USER_CREATE_SUCCESS,
  USER_DELETE_ERROR,
  USER_DELETE_SUCCESS,

  USERS_CHANGE,
  USERS_REQUEST_ERROR,

  VISIBILITY_CHANGE
} from './EventTypes';
import AuthStore from '../stores/AuthStore';
import ChronosStore from '../stores/ChronosStore';
import ConfigStore from '../stores/ConfigStore';
import DCOSStore from '../stores/DCOSStore';
import HistoryStore from '../stores/HistoryStore';
import MarathonStore from '../stores/MarathonStore';
import MesosLogStore from '../stores/MesosLogStore';
import MesosStateStore from '../stores/MesosStateStore';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import MetadataStore from '../stores/MetadataStore';
import NodeHealthStore from '../stores/NodeHealthStore';
import NotificationStore from '../stores/NotificationStore';
import SidebarStore from '../stores/SidebarStore';
import TaskDirectoryStore from '../stores/TaskDirectoryStore';
import UnitHealthStore from '../stores/UnitHealthStore';
import UserStore from '../stores/UserStore';
import UsersStore from '../stores/UsersStore';
import VisibilityStore from '../stores/VisibilityStore';

const ListenersDescription = {
  auth: {
    store: AuthStore,
    events: {
      success: AUTH_USER_LOGIN_CHANGED,
      error: AUTH_USER_LOGIN_ERROR,
      logoutSuccess: AUTH_USER_LOGOUT_SUCCESS,
      logoutError: AUTH_USER_LOGOUT_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  chronos: {
    store: ChronosStore,
    events: {
      change: CHRONOS_JOBS_CHANGE,
      error: CHRONOS_JOBS_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  config: {
    store: ConfigStore,
    events: {
      success: CONFIG_LOADED,
      error: CONFIG_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

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

  nodeHealth: {
    store: NodeHealthStore,
    events: {
      success: HEALTH_NODES_CHANGE,
      error: HEALTH_NODES_ERROR,
      nodeSuccess: HEALTH_NODE_SUCCESS,
      nodeError: HEALTH_NODE_ERROR,
      unitsSuccess: HEALTH_NODE_UNITS_SUCCESS,
      unitsError: HEALTH_NODE_UNITS_ERROR,
      unitSuccess: HEALTH_NODE_UNIT_SUCCESS,
      unitError: HEALTH_NODE_UNIT_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  cosmosPackages: {
    store: CosmosPackagesStore,
    events: {
      availableError: COSMOS_SEARCH_ERROR,
      availableSuccess: COSMOS_SEARCH_CHANGE,
      descriptionSuccess: COSMOS_DESCRIBE_CHANGE,
      descriptionError: COSMOS_DESCRIBE_ERROR,
      installedSuccess: COSMOS_LIST_CHANGE,
      installedError: COSMOS_LIST_ERROR,

      installError: COSMOS_INSTALL_ERROR,
      installSuccess: COSMOS_INSTALL_SUCCESS,
      uninstallError: COSMOS_UNINSTALL_ERROR,
      uninstallSuccess: COSMOS_UNINSTALL_SUCCESS,

      repositoriesSuccess: COSMOS_REPOSITORIES_SUCCESS,
      repositoriesError: COSMOS_REPOSITORIES_ERROR,
      repositoryAddSuccess: COSMOS_REPOSITORY_ADD_SUCCESS,
      repositoryAddError: COSMOS_REPOSITORY_ADD_ERROR,
      repositoryDeleteSuccess: COSMOS_REPOSITORY_DELETE_SUCCESS,
      repositoryDeleteError: COSMOS_REPOSITORY_DELETE_ERROR
    },
    unmountWhen: function (store, event) {
      return event === 'availableSuccess';
    },
    listenAlways: false
  },

  history: {
    store: HistoryStore,
    events: {
      change: HISTORY_CHANGE
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: false
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

  summary: {
    // Which store to use
    store: MesosSummaryStore,

    // What event to listen to
    events: {
      success: MESOS_SUMMARY_CHANGE,
      error: MESOS_SUMMARY_REQUEST_ERROR
    },

    // When to remove listener
    unmountWhen: function (store, event) {
      if (event === 'success') {
        return store.get('statesProcessed');
      }
    },

    // Set to true to keep listening until unmount
    listenAlways: true
  },

  dcos: {
    store: DCOSStore,
    events: {
      change: DCOS_CHANGE
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

  marathon: {
    store: MarathonStore,
    events: {
      appsSuccess: MARATHON_APPS_CHANGE,
      appsError: MARATHON_APPS_ERROR,
      deploymentsSuccess: MARATHON_DEPLOYMENTS_CHANGE,
      deploymentsError: MARATHON_DEPLOYMENTS_ERROR,
      groupCreateSuccess: MARATHON_GROUP_CREATE_SUCCESS,
      groupCreateError: MARATHON_GROUP_CREATE_ERROR,
      serviceCreateSuccess: MARATHON_SERVICE_CREATE_SUCCESS,
      serviceCreateError: MARATHON_SERVICE_CREATE_ERROR
    },
    unmountWhen: function (store, event) {
      if (event === 'appsSuccess') {
        return store.hasProcessedApps();
      }
      return true;
    },
    listenAlways: true
  },

  metadata: {
    store: MetadataStore,
    events: {
      success: METADATA_CHANGE,
      dcosSuccess: DCOS_METADATA_CHANGE
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  },

  mesosLog: {
    store: MesosLogStore,
    events: {
      success: MESOS_LOG_CHANGE,
      error: MESOS_LOG_REQUEST_ERROR
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true,
    suppressUpdate: true
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
