var _ = require('underscore');
import {Store} from 'mesosphere-shared-reactjs';

var AppDispatcher = require('../events/AppDispatcher');
import ActionTypes from '../constants/ActionTypes';
import CompositeState from '../structs/CompositeState';
var Config = require('../config/Config');
import {
  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
var GetSetMixin = require('../mixins/GetSetMixin');
var MesosSummaryUtil = require('../utils/MesosSummaryUtil');
var MesosSummaryActions = require('../events/MesosSummaryActions');
import SummaryList from '../structs/SummaryList';
import StateSummary from '../structs/StateSummary';
var TimeScales = require('../constants/TimeScales');
import VisibilityStore from './VisibilityStore';

var requestInterval = null;

function startPolling() {
  if (requestInterval == null && MesosSummaryStore.shouldPoll()) {
    // Should always retrieve bulk summary when polling starts
    MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
    requestInterval = setInterval(
      MesosSummaryActions.fetchSummary, Config.getRefreshRate()
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
  } else {
    startPolling();
  }
}

VisibilityStore.addChangeListener(VISIBILITY_CHANGE, handleInactiveChange);

var MesosSummaryStore = Store.createStore({
  storeID: 'summary',

  mixins: [GetSetMixin],

  init: function () {
    if (this.get('initCalledAt') != null) {
      return;
    }

    this.set({
      initCalledAt: Date.now(), // log when we started calling
      loading: null,
      states: this.getInitialStates(),
      prevMesosStatusesMap: {},
      statesProcessed: false,
      taskFailureRate: MesosSummaryUtil.getInitialTaskFailureRates()
    });

    startPolling();
  },

  getInitialStates: function () {
    let initialStates = MesosSummaryUtil.getInitialStates();
    let states = new SummaryList({maxLength: Config.historyLength});
    _.clone(initialStates).forEach(state => {
      states.addSnapshot(state, state.date);
    });

    return states;
  },

  unmount: function () {
    this.set({
      initCalledAt: null,
      loading: null,
      states: this.getInitialStates(),
      prevMesosStatusesMap: {},
      statesProcessed: false,
      taskFailureRate: []
    });

    stopPolling();
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);

    startPolling();
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  },

  shouldPoll: function () {
    return !_.isEmpty(this.listeners(MESOS_SUMMARY_CHANGE));
  },

  getActiveServices: function () {
    return this.get('states').lastSuccessful().getServiceList().getItems();
  },

  getServiceFromName: function (name) {
    let services = this.getActiveServices();

    return _.find(services, function (service) {
      return service.get('name') === name;
    });
  },

  hasServiceUrl: function (serviceName) {
    let service = MesosSummaryStore.getServiceFromName(serviceName);
    let webuiUrl = service.get('webui_url');

    return service && !!webuiUrl && webuiUrl.length > 0;
  },

  setFailureRate: function (state, prevState) {
    var taskFailureRate = this.processFailureRate(state, prevState);
    this.set({taskFailureRate});
  },

  updateStateProcessed: function () {
    this.set({statesProcessed: true});
    this.emit(MESOS_SUMMARY_CHANGE);
  },

  notifySummaryProcessed: function () {
    var initCalledAt = this.get('initCalledAt');
    // skip if state is processed, already loading or init has not been called
    if (this.get('statesProcessed') ||
        this.get('loading') != null ||
        initCalledAt == null) {
      this.emit(MESOS_SUMMARY_CHANGE);
      return;
    }

    var msLeftOfDelay = Config.stateLoadDelay - (Date.now() - initCalledAt);

    if (msLeftOfDelay < 0) {
      this.updateStateProcessed();
    } else {
      this.set({
        loading: setTimeout(
          this.updateStateProcessed.bind(this),
          msLeftOfDelay
        )
      });
    }
  },

  processFailureRate: function (state, prevState) {
    var currentFailureRate = MesosSummaryUtil.getFailureRate(state, prevState);

    var taskFailureRate = this.get('taskFailureRate');
    taskFailureRate.push(currentFailureRate);
    taskFailureRate.shift();
    return taskFailureRate;
  },

  processSummary: function (data, options = {}) {
    // If request to Mesos times out we get an empty Object
    if (!Object.keys(data).length) {
      return this.processSummaryError();
    }

    let states = this.get('states');
    let prevState = states.last();

    if (typeof data.date !== 'number') {
      data.date = Date.now();
    }

    CompositeState.addSummary(data);

    states.addSnapshot(data, data.date);
    this.setFailureRate(states.last(), prevState);

    if (!options.silent) {
      this.notifySummaryProcessed();
    }
  },

  processBulkState: function (data) {
    if (!Array.isArray(data)) {
      return MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
    }
    // Multiply Config.stateRefresh in order to use larger time slices
    data = MesosSummaryUtil.addTimestampsToData(data, Config.getRefreshRate());
    _.each(data, function (datum) {
      MesosSummaryStore.processSummary(datum, {silent: true});
    });
  },

  processSummaryError: function (options = {}) {
    let unsuccessfulSummary = new StateSummary({successful: false});
    let states = this.get('states');
    let prevState = states.last();

    states.add(unsuccessfulSummary);
    this.setFailureRate(states.last(), prevState);

    if (!options.silent) {
      this.emit(MESOS_SUMMARY_REQUEST_ERROR);
    }
  },

  processOngoingRequest: function () {
    // Handle ongoing request here.
  },

  processBulkError: function () {
    for (let i = 0; i < Config.historyLength; i++) {
      MesosSummaryStore.processSummaryError({silent: true});
    }
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== ActionTypes.SERVER_ACTION) {
      return false;
    }

    var action = payload.action;
    switch (action.type) {
      case ActionTypes.REQUEST_MESOS_SUMMARY_SUCCESS:
        MesosSummaryStore.processSummary(action.data);
        break;
      case ActionTypes.REQUEST_MESOS_HISTORY_SUCCESS:
        MesosSummaryStore.processBulkState(action.data);
        break;
      case ActionTypes.REQUEST_MESOS_SUMMARY_ERROR:
        MesosSummaryStore.processSummaryError();
        break;
      case ActionTypes.REQUEST_MESOS_HISTORY_ERROR:
        MesosSummaryStore.processBulkError();
        break;
      case ActionTypes.REQUEST_MESOS_SUMMARY_ONGOING:
      case ActionTypes.REQUEST_MESOS_HISTORY_ONGOING:
        MesosSummaryStore.processSummaryError();
        break;
    }

    return true;
  })

});

module.exports = MesosSummaryStore;
