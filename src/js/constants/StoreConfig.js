import {
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR
} from './EventTypes';
import MesosStateStore from '../stores/MesosStateStore';

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
  }
};

module.exports = ListenersDescription;
