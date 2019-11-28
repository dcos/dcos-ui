import PluginSDK from "PluginSDK";

import {
  REQUEST_SUMMARY_ERROR,
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

let requestInterval = null;

/**
 * @this {MesosSummaryStore}
 */

function startPolling() {
  if (requestInterval == null) {
    requestInterval = setInterval(() => {
      MesosSummaryActions.fetchSummary();
    }, Config.getRefreshRate());

    MesosSummaryActions.fetchSummary();
  }
}

function stopPolling() {
  if (requestInterval != null) {
    clearInterval(requestInterval);
    requestInterval = null;
  }
}

class MesosSummaryStore extends GetSetBaseStore {
  constructor(...args) {
    super(...args);

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

    AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;
      switch (action.type) {
        case REQUEST_SUMMARY_SUCCESS:
          this.processSummary(action.data);
          break;
        case REQUEST_SUMMARY_ERROR:
          this.processSummaryError();
          break;
        case REQUEST_SUMMARY_ONGOING:
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
    return this.get("states")
      .lastSuccessful()
      .getServiceList()
      .getItems();
  }

  getServiceFromName(name) {
    const services = this.getActiveServices();

    return services.find(service => service.get("name") === name);
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

  getLastSuccessfulSummarySnapshot() {
    const states = this.get("states");
    let lastSuccessful = null;
    if (states) {
      lastSuccessful = states.lastSuccessful().snapshot;
    }

    return lastSuccessful;
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

    CompositeState.addState(data);

    states.addSnapshot(data, data.date);

    if (!options.silent) {
      this.set({ statesProcessed: true });
      this.emit(MESOS_SUMMARY_CHANGE);
    }
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
