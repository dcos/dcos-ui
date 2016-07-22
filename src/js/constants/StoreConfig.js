import {
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

  METADATA_CHANGE,

  METRONOME_JOB_CREATE_SUCCESS,
  METRONOME_JOB_CREATE_ERROR,
  METRONOME_JOB_DELETE_SUCCESS,
  METRONOME_JOB_DELETE_ERROR,
  METRONOME_JOB_DETAIL_CHANGE,
  METRONOME_JOB_DETAIL_ERROR,
  METRONOME_JOB_UPDATE_SUCCESS,
  METRONOME_JOB_UPDATE_ERROR,
  METRONOME_JOB_RUN_ERROR,
  METRONOME_JOB_RUN_SUCCESS,
  METRONOME_JOB_STOP_RUN_ERROR,
  METRONOME_JOB_STOP_RUN_SUCCESS,
  METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
  METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
  METRONOME_JOBS_CHANGE,
  METRONOME_JOBS_ERROR,

  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR,
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,

  NOTIFICATION_CHANGE,

  DCOS_METADATA_CHANGE,

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
import MetronomeStore from '../stores/MetronomeStore';
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

  metronome: {
    store: MetronomeStore,
    events: {
      jobCreateSuccess: METRONOME_JOB_CREATE_SUCCESS,
      jobCreateError: METRONOME_JOB_CREATE_ERROR,
      jobDeleteSuccess: METRONOME_JOB_DELETE_SUCCESS,
      jobDeleteError: METRONOME_JOB_DELETE_ERROR,
      jobDetailChange: METRONOME_JOB_DETAIL_CHANGE,
      jobDetailError: METRONOME_JOB_DETAIL_ERROR,
      jobUpdateSuccess: METRONOME_JOB_UPDATE_SUCCESS,
      jobUpdateError: METRONOME_JOB_UPDATE_ERROR,
      jobRunError: METRONOME_JOB_RUN_ERROR,
      jobRunSuccess: METRONOME_JOB_RUN_SUCCESS,
      jobStopRunError: METRONOME_JOB_STOP_RUN_ERROR,
      jobStopRunSuccess: METRONOME_JOB_STOP_RUN_SUCCESS,
      jobScheduleUpdateError: METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
      jobScheduleUpdateSuccess: METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
      change: METRONOME_JOBS_CHANGE,
      error: METRONOME_JOBS_ERROR
    },
    unmountWhen: function () {
      return true;
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
