import {EventEmitter} from 'events';

import AppDispatcher from '../events/AppDispatcher';
import ChronosActions  from '../events/ChronosActions';
import {
  CHRONOS_CHANGE
} from '../constants/EventTypes';
import Config from '../config/Config';
import Job from '../structs/Job';
import JobTree from '../structs/JobTree';
import {
  REQUEST_CHRONOS_JOBS_ERROR,
  REQUEST_CHRONOS_JOBS_ONGOING,
  REQUEST_CHRONOS_JOBS_SUCCESS,
  SERVER_ACTION
} from '../constants/ActionTypes';

let requestInterval;

function startPolling() {
  if (requestInterval) {
    global.clearInterval(requestInterval);
  }

  requestInterval = global.setInterval(function () {
    ChronosActions.fetchJobs();
  }, Config.getRefreshRate());
}

class DCOSStore extends EventEmitter {

  constructor() {
    super(...arguments);

    this.data = {
      jobs: new JobTree()
    };

    // Handle app actions
    this.dispatcherIndex = AppDispatcher.register(({source, action}) => {
      if (source !== SERVER_ACTION) {
        return false;
      }
      switch (action.type) {
        case REQUEST_CHRONOS_JOBS_SUCCESS:
          if (Array.isArray(action.data)) {
            action.data.forEach((job) => {
              this.data.jobs.add(new Job(job));
            });
          }
          this.emit(CHRONOS_CHANGE);
          break;
        case REQUEST_CHRONOS_JOBS_ONGOING:
          break;
        case REQUEST_CHRONOS_JOBS_ERROR:
          break;

      }

      return true;
    })
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  /**
   * Adds the listener for the specified event
   * @param {string} eventName
   * @param {Function} callback
   * @return {DCOSStore} DCOSStore instance
   * @override
   */
  on(eventName, callback) {
    super.on(eventName, callback);

    // Start polling if there is at least one listener
    if (this.listenerCount(CHRONOS_CHANGE) > 0) {
      startPolling();
    }

    return this;
  }

  /**
   * Remove the specified listener for the specified event
   * @param {string} eventName
   * @param {Function} callback
   * @return {DCOSStore} DCOSStore instance
   * @override
   */
  removeListener(eventName, callback) {
    super.removeListener(eventName, callback);

    // Stop polling if no one is listening
    if (this.listenerCount(CHRONOS_CHANGE) === 0) {
      global.clearInterval(this._requestInterval);
      this._requestInterval = null;
    }

    return this;
  }

  /**
   * @type {ServiceTree}
   */
  get jobTree() {
    return this.data.jobs;
  }

  static get storeID() {
    return 'chronos';
  }
}

module.exports = new DCOSStore();
