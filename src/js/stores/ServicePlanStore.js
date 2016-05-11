import {Store, StoreMixin} from 'mesosphere-shared-reactjs';

import {
  REQUEST_PLAN_FETCH_SUCCESS,
  REQUEST_PLAN_FETCH_ERROR,
  REQUEST_PLAN_DECISION_SUCCESS,
  REQUEST_PLAN_DECISION_ERROR,
  SERVER_ACTION
} from '../constants/ActionTypes';

import {
  PLAN_CHANGE,
  PLAN_ERROR,
  PLAN_DECISION_SUCCESS,
  PLAN_DECISION_ERROR
} from '../constants/EventTypes';

import AppDispatcher from '../events/AppDispatcher';
import Config from '../config/Config';
import GetSetMixin from '../mixins/GetSetMixin';
import ServicePlan from '../structs/ServicePlan';
import ServicePlanCommandTypes from '../constants/ServicePlanCommandTypes';
import ServicePlanActions from '../events/ServicePlanActions';
import VisibilityStore from '../stores/VisibilityStore';

let isInactive = false;
let servicePlanListeners = {};
let fetchTimers = {};

function bindCommand(command) {
  return ServicePlanActions.sendDecisionCommand.bind(null, command);
}

let ServicePlanStore = Store.createStore({
  storeID: 'servicePlan',

  mixins: [GetSetMixin, StoreMixin],

  getSet_data: {
    plans: {}
  },

  fetchPlan: ServicePlanActions.fetchPlan,

  continuePlan: bindCommand(ServicePlanCommandTypes.CONTINUE),

  interruptPlan: bindCommand(ServicePlanCommandTypes.INTERRUPT),

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  addPlanChangeListener: function (serviceID, callback) {
    if (!(serviceID in servicePlanListeners)) {
      servicePlanListeners[serviceID] = [];
    }
    servicePlanListeners[serviceID].push(callback);

    this.fetchPlan(serviceID);
    this.monitorPlan(serviceID);
  },

  removePlanChangeListener: function (serviceID, callback) {
    if (serviceID in servicePlanListeners) {
      servicePlanListeners[serviceID] = servicePlanListeners[serviceID]
        .filter(function (cb) {
          return cb !== callback;
        });
    }
    if (servicePlanListeners[serviceID].length === 0) {
      delete servicePlanListeners[serviceID];

      // Clear timer if exists
      if (serviceID in fetchTimers) {
        clearInterval(fetchTimers[serviceID]);
        delete fetchTimers[serviceID];
      }
    }
  },

  init: function () {
    this.store_initializeListeners([{
      name: 'visibility',
      events: ['change']
    }]);

    return this;
  },

  getServicePlan: function (serviceID) {
    let plans = this.get('plans');

    if (serviceID in plans) {
      return new ServicePlan(plans[serviceID]);
    }

    return null;
  },

  shouldMonitorServicePlan: function (serviceID) {
    return (serviceID in servicePlanListeners)
      && !VisibilityStore.isInactive();
  },

  monitorPlan: function (serviceID) {
    if (serviceID in fetchTimers) {
      // Already monitoring
      return;
    }

    if (this.shouldMonitorServicePlan(serviceID)) {
      fetchTimers[serviceID] = setInterval(this.fetchPlan.bind(this, serviceID), Config.stateRefresh);
    }
  },

  onVisibilityStoreChange: function () {
    // Transitioned to active
    if (isInactive && !VisibilityStore.isInactive()) {
      Object.keys(servicePlanListeners).forEach(this.monitorPlan);
    }
    // Transitioned to inactive
    if (!isInactive && VisibilityStore.isInactive()) {
      Object.values(fetchTimers).forEach(clearInterval);
      fetchTimers = {};
    }

    isInactive = VisibilityStore.isInactive();
  },

  processPlanFetchSuccess: function (serviceID, plan) {
    let plans = Object.assign({}, this.get('plans'), {[serviceID]: plan});

    this.set({plans});

    // Invoke callbacks for serviceID with instance of ServicePlan struct
    if (serviceID in servicePlanListeners) {
      servicePlanListeners[serviceID].forEach(callback =>
        callback(this.getServicePlan(serviceID))
      );
    }
    // Emit event for StoreConfig Listeners
    this.emit(PLAN_CHANGE, serviceID);
  },

  processPlanFetchError: function (error, serviceID) {
    this.emit(PLAN_ERROR, error, serviceID);
  },

  processPlanDecisionSuccess(serviceID) {
    this.fetchPlan(serviceID);
    this.emit(PLAN_DECISION_SUCCESS, serviceID);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case REQUEST_PLAN_FETCH_SUCCESS:
        ServicePlanStore.processPlanFetchSuccess(
          action.serviceID,
          action.data
        );
        break;
      case REQUEST_PLAN_FETCH_ERROR:
        ServicePlanStore.processPlanFetchError(
          action.data,
          action.serviceID
        );
        break;
      case REQUEST_PLAN_DECISION_SUCCESS:
        ServicePlanStore.processPlanDecisionSuccess(
          action.serviceID
        );
        break;
      case REQUEST_PLAN_DECISION_ERROR:
        ServicePlanStore.emit(
          PLAN_DECISION_ERROR,
          action.data,
          action.serviceID
        );
        break;
    }

    return true;
  })

}).init();

module.exports = ServicePlanStore;
