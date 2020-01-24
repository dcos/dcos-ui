import LicensingStore from "../licensing/stores/LicensingStore";
import { LICENSING_SUMMARY_SUCCESS } from "../licensing/constants/EventTypes";

const SDK = require("./SDK");

module.exports = {
  actions: ["intercomBoot", "intercomShutdown"],

  initialize() {
    this.actions.forEach(action => {
      SDK.getSDK().Hooks.addAction(action, this[action].bind(this));
    });
  },

  addLicensingAttributes() {
    const licensingSummary = LicensingStore.getLicensingSummary();

    window.Intercom("update", {
      node_capacity: licensingSummary.getNodeCapacity(),
      license_expiration_date: licensingSummary.getExpiration()
    });
  },

  intercomBoot() {
    LicensingStore.addChangeListener(
      LICENSING_SUMMARY_SUCCESS,
      this.addLicensingAttributes
    );

    if (LicensingStore.getLicensingSummary()) {
      this.addLicensingAttributes();
    }
  },

  intercomShutdown() {
    LicensingStore.removeChangeListener(
      LICENSING_SUMMARY_SUCCESS,
      this.addLicensingAttributes
    );
  }
};
