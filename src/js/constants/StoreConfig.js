import {
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,

  VISIBILITY_CHANGE
} from './EventTypes';
import MesosStateStore from '../stores/MesosStateStore';
import VisibilityStore from '../stores/VisibilityStore';

const ListenersDescription = {
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

  visibility: {
    store: VisibilityStore,
    events: {
      change: VISIBILITY_CHANGE
    },
    unmountWhen: function () {
      return true;
    },
    listenAlways: true
  }
};

module.exports = ListenersDescription;
