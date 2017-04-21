import PluginSDK from "PluginSDK";

import {
  REQUEST_SUMMARY_ERROR,
  REQUEST_SUMMARY_HISTORY_ONGOING,
  REQUEST_SUMMARY_HISTORY_SUCCESS,
  REQUEST_SUMMARY_ONGOING,
  REQUEST_SUMMARY_SUCCESS,
  SERVER_ACTION
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import CompositeState from "../structs/CompositeState";
import Config from "../config/Config";
import {
  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR
} from "../constants/EventTypes";
import GetSetBaseStore from "./GetSetBaseStore";
import MesosSummaryActions from "../events/MesosSummaryActions";
import MesosSummaryUtil from "../utils/MesosSummaryUtil";
import StateSummary from "../structs/StateSummary";
import SummaryList from "../structs/SummaryList";
import TimeScales from "../constants/TimeScales";
import Util from "../utils/Util";
import VisibilityStore from "./VisibilityStore";

let requestInterval = null;
let isInactive = false;

/**
 * @this {MesosSummaryStore}
 */
function startPolling() {
  if (requestInterval == null) {
    // Should always retrieve bulk summary when polling starts
    MesosSummaryActions.fetchSummary(TimeScales.MINUTE);

    requestInterval = setInterval(() => {
      const wasInactive = isInactive && !VisibilityStore.get("isInactive");
      isInactive = VisibilityStore.get("isInactive");

      if (!isInactive) {
        if (wasInactive) {
          // Flush history with new data set
          MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
        } else {
          MesosSummaryActions.fetchSummary();
        }
      } else {
        // If not active, push null placeholder. This will ensure we maintain
        // history when navigating back, for case where history server is down.

        // Use {silent: true} Because we only want to push a summary on the stack without side
        // effects (like re-rendering etc). The tab is out of focus so we
        // don't want it to do any work. It only matters that there is
        // appropriate history when we return focus to the tab.
        this.processSummaryError({ silent: true });
      }
    }, Config.getRefreshRate());
  }
}

function stopPolling() {
  if (requestInterval != null) {
    clearInterval(requestInterval);
    requestInterval = null;
  }
}

class MesosSummaryStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: MESOS_SUMMARY_CHANGE,
        error: MESOS_SUMMARY_REQUEST_ERROR
      },

      // When to remove listener
      unmountWhen(store, event) {
        if (event === "success") {
          return store.get("statesProcessed");
        }
      },

      // Set to true to keep listening until unmount
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case REQUEST_SUMMARY_SUCCESS:
          this.processSummary(action.data);
          break;
        case REQUEST_SUMMARY_HISTORY_SUCCESS:
          this.processBulkState(action.data);
          break;
        case REQUEST_SUMMARY_ERROR:
          this.processSummaryError();
          break;
        case REQUEST_SUMMARY_ONGOING:
        case REQUEST_SUMMARY_HISTORY_ONGOING:
          this.processSummaryError();
          break;
      }

      return true;
    });
  }

  init() {
    this.set({
      states: this.getInitialStates(),
      prevMesosStatusesMap: {},
      statesProcessed: false
    });

    startPolling.call(this);
  }

  getInitialStates() {
    const initialStates = MesosSummaryUtil.getInitialStates().slice();
    const states = new SummaryList({ maxLength: Config.historyLength });
    initialStates.forEach(state => {
      states.addSnapshot(state, state.date, false);
    });

    return states;
  }

  unmount() {
    this.set({
      states: this.getInitialStates(),
      prevMesosStatusesMap: {},
      statesProcessed: false
    });

    stopPolling();
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);

    if (!this.shouldPoll()) {
      startPolling.call(this);
    }
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  }

  shouldPoll() {
    return this.listeners(MESOS_SUMMARY_CHANGE).length > 0;
  }

  getActiveServices() {
    return this.get("states").lastSuccessful().getServiceList().getItems();
  }

  getServiceFromName(name) {
    const services = this.getActiveServices();

    return services.find(function(service) {
      return service.get("name") === name;
    });
  }

  hasServiceUrl(serviceName) {
    const service = this.getServiceFromName(serviceName);
    const webuiUrl = service.get("webui_url");

    return service && webuiUrl != null && webuiUrl.length > 0;
  }

  getNextRequestTime() {
    const lastRequestTime = this.get("lastRequestTime");
    if (!lastRequestTime) {
      return Date.now();
    }

    // We want a consistent interval, this is how we're going to do it
    return lastRequestTime + Config.getRefreshRate();
  }

  processSummary(data, options = {}) {
    // If request to Mesos times out we get an empty Object
    if (!Object.keys(data).length) {
      return this.processSummaryError();
    }

    const states = this.get("states");

    if (typeof data.date !== "number") {
      const lastRequestTime = this.getNextRequestTime();
      this.set({ lastRequestTime });
      data.date = lastRequestTime;
    }

    CompositeState.addSummary(data);

    states.addSnapshot(data, data.date);

    if (!options.silent) {
      this.set({ statesProcessed: true });
      this.emit(MESOS_SUMMARY_CHANGE);
    }
  }

  processBulkState(data) {
    if (!Array.isArray(data)) {
      return MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
    }

    // If we get less data than the history length
    // fill the front with the `n` copies of the earliest snapshot available
    if (data.length < Config.historyLength) {
      const diff = Config.historyLength - data.length;
      for (var i = 0; i < diff; i++) {
        data.unshift(Util.deepCopy(data[0]));
      }
    }

    // Multiply Config.stateRefresh in order to use larger time slices
    data = MesosSummaryUtil.addTimestampsToData(data, Config.getRefreshRate());
    data.forEach(datum => {
      this.processSummary(datum, { silent: true });
    });
    this.set({ lastRequestTime: Date.now() });
    this.emit(MESOS_SUMMARY_CHANGE);
  }

  processSummaryError(options = {}) {
    const unsuccessfulSummary = new StateSummary({ successful: false });
    const states = this.get("states");

    this.set({ lastRequestTime: this.getNextRequestTime() });

    states.add(unsuccessfulSummary);

    if (!options.silent) {
      this.emit(MESOS_SUMMARY_REQUEST_ERROR);
    }
  }

  get storeID() {
    return "summary";
  }
}

module.exports = new MesosSummaryStore();
