import BaseStore from "#SRC/js/stores/BaseStore";
import LicensingActions from "../actions/LicensingActions";
import LicensingSummary from "../structs/LicensingSummary";

import {
  REQUEST_LICENSING_SUMMARY_ERROR,
  REQUEST_LICENSING_SUMMARY_SUCCESS
} from "../constants/ActionTypes";
import {
  LICENSING_SUMMARY_SUCCESS,
  LICENSING_SUMMARY_ERROR
} from "../constants/EventTypes";

const SDK = require("../SDK");

// 60 min = 1000 ms/s * 60 sec/min * 60 min = 3,600,000 ms
const LICENSING_POLLING_FREQUENCY = 1000 * 60 * 60;

class LicensingStore extends BaseStore {
  constructor(...args) {
    super(...args);

    this.licensingSummary = null;
    this.requestInterval = null;

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "licensing",
      events: {
        licensingSummarySuccess: LICENSING_SUMMARY_SUCCESS,
        licensingSummaryError: LICENSING_SUMMARY_ERROR
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      const data = action.data;

      switch (action.type) {
        case REQUEST_LICENSING_SUMMARY_SUCCESS:
          this.processLicensingSummarySuccess(data);
          break;
        case REQUEST_LICENSING_SUMMARY_ERROR:
          this.processLicensingSummaryError(data);
          break;
      }
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
    this.startPolling();
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  fetchLicensingSummary(...args) {
    LicensingActions.fetchLicensingSummary(...args);
  }

  getLicensingSummary() {
    const licensing = this.licensingSummary;
    if (licensing) {
      return new LicensingSummary(licensing);
    }

    return null;
  }

  startPolling() {
    if (!(this.listeners(LICENSING_SUMMARY_SUCCESS).length > 0)) {
      return;
    }

    const poll = () => {
      LicensingActions.fetchLicensingSummary();
    };

    if (this.requestInterval == null) {
      poll();
      this.requestInterval = setInterval(poll, LICENSING_POLLING_FREQUENCY);
    }
  }

  stopPolling() {
    if (this.requestInterval != null) {
      clearInterval(this.requestInterval);
      this.requestInterval = null;
    }
  }

  processLicensingSummarySuccess(licensingSummary) {
    this.licensingSummary = licensingSummary;

    this.emit(LICENSING_SUMMARY_SUCCESS);
  }

  processLicensingSummaryError(data) {
    this.licensingSummary = null;

    this.emit(LICENSING_SUMMARY_ERROR, data);
  }
}

export default new LicensingStore();
