import {EventEmitter} from 'events';

import AppDispatcher from '../events/AppDispatcher';
import ChronosActions  from '../events/ChronosActions';
import {
  CHRONOS_JOBS_CHANGE,
  CHRONOS_JOBS_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
import Config from '../config/Config';
import JobTree from '../structs/JobTree';
import {
  REQUEST_CHRONOS_JOBS_ERROR,
  REQUEST_CHRONOS_JOBS_ONGOING,
  REQUEST_CHRONOS_JOBS_SUCCESS,
  SERVER_ACTION
} from '../constants/ActionTypes';

import VisibilityStore from './VisibilityStore';

let requestInterval;

function startPolling() {
  if (!requestInterval) {
    ChronosActions.fetchJobs();
    requestInterval = global.setInterval(
      ChronosActions.fetchJobs,
      Config.getRefreshRate()
    );
  }
}

function stopPolling() {
  if (requestInterval) {
    global.clearInterval(requestInterval);
    requestInterval = null;
  }
}

function handleInactiveChange() {
  let isInactive = VisibilityStore.get('isInactive');
  if (isInactive) {
    stopPolling();
  }

  if (!isInactive && ChronosStore.shouldPoll()) {
    startPolling();
  }
}

VisibilityStore.addChangeListener(VISIBILITY_CHANGE, handleInactiveChange);

class ChronosStore extends EventEmitter {
  constructor() {
    super(...arguments);

    this.data = {
      jobTree: {id: '/', items: []}
    };

    // Handle app actions
    this.dispatcherIndex = AppDispatcher.register(({source, action}) => {
      if (source !== SERVER_ACTION) {
        return false;
      }
      switch (action.type) {
        case REQUEST_CHRONOS_JOBS_SUCCESS:
          this.data.jobTree = action.data;
          this.emit(CHRONOS_JOBS_CHANGE);
          break;
        case REQUEST_CHRONOS_JOBS_ONGOING:
          break;
        case REQUEST_CHRONOS_JOBS_ERROR:
          this.emit(CHRONOS_JOBS_ERROR);
          break;

      }

      return true;
    })
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);

    // Start polling if there is at least one listener
    if (this.shouldPoll()) {
      startPolling();
    }
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);

    // Stop polling if no one is listening
    if (!this.shouldPoll()) {
      stopPolling();
    }
  }

  shouldPoll() {
    return !!this.listeners(CHRONOS_JOBS_CHANGE).length;
  }

  /**
   * @type {JobTree}
   */
  get jobTree() {
    return new JobTree(this.data.jobTree);
  }

  static get storeID() {
    return 'chronos';
  }
}

module.exports = new ChronosStore();
