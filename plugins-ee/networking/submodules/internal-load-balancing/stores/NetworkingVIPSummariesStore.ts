import BaseStore from "#SRC/js/stores/BaseStore";

import {
  REQUEST_NETWORKING_VIP_SUMMARIES_ERROR,
  REQUEST_NETWORKING_VIP_SUMMARIES_SUCCESS,
  REQUEST_NETWORKING_VIP_SUMMARIES_ONGOING
} from "../constants/ActionTypes";

import {
  NETWORKING_VIP_SUMMARIES_CHANGE,
  NETWORKING_VIP_SUMMARIES_ERROR
} from "../constants/EventTypes";

import NetworkingActions from "../actions/NetworkingActions";
import NetworkingConfig from "../../../config/NetworkingConfig";
import VIPSummaryList from "../structs/VIPSummaryList";

const SDK = require("../../../SDK");

let fetchVIPSummariesInterval = null;

class NetworkingVIPSummariesStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "networkingVIPSummaries",
      events: {
        success: NETWORKING_VIP_SUMMARIES_CHANGE,
        error: NETWORKING_VIP_SUMMARIES_ERROR
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      switch (action.type) {
        case REQUEST_NETWORKING_VIP_SUMMARIES_SUCCESS:
          this.processVIPSummaries(action.data);
          break;
        case REQUEST_NETWORKING_VIP_SUMMARIES_ERROR:
          this.processVIPSummariesError(action.data);
          break;
        case REQUEST_NETWORKING_VIP_SUMMARIES_ONGOING:
          this.handleOngoingVIPSummariesRequest();
          break;
      }

      return true;
    });
  }

  startFetchVIPSummaries() {
    if (fetchVIPSummariesInterval) {
      return;
    }

    NetworkingActions.fetchVIPSummaries();

    fetchVIPSummariesInterval = window.setInterval(() => {
      NetworkingActions.fetchVIPSummaries();
    }, NetworkingConfig.fetchInterval);
  }

  stopFetchVIPSummaries() {
    if (fetchVIPSummariesInterval) {
      window.clearInterval(fetchVIPSummariesInterval);
      fetchVIPSummariesInterval = null;
    }
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState().internalLoadBalancing[prop];
  }

  getVIPSummaries() {
    return new VIPSummaryList({ items: this.get("vipSummaries") });
  }

  handleOngoingVIPSummariesRequest() {
    // We could do something here if we wanted
  }

  processVIPSummaries(vipSummaries) {
    SDK.getSDK().dispatch({
      vipSummaries,
      type: NETWORKING_VIP_SUMMARIES_CHANGE
    });
    this.emit(NETWORKING_VIP_SUMMARIES_CHANGE);
  }

  processVIPSummariesError(error) {
    this.emit(NETWORKING_VIP_SUMMARIES_ERROR, error);
  }
}

export default new NetworkingVIPSummariesStore();
