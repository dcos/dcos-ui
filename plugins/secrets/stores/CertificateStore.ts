import { EventEmitter } from "events";

import * as EventTypes from "../constants/EventTypes";
import * as ActionTypes from "../constants/ActionTypes";
import CertificateActions from "../actions/CertificateActions";
import CertificatesList from "../structs/CertificatesList";

const SDK = require("../SDK");

class CertificateStore extends EventEmitter {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "certificates",
      events: {
        certificatesSuccess: EventTypes.CERTIFICATE_ALL_CERTIFICATES_SUCCESS,
        certificatesError: EventTypes.CERTIFICATE_ALL_CERTIFICATES_ERROR,
      },
      unmountWhen: () => false,
    });

    SDK.getSDK().onDispatch((action) => {
      switch (action.type) {
        case ActionTypes.REQUEST_ALL_CERTIFICATES_SUCCESS:
          this.processCertificates(action.data);
          break;
        case ActionTypes.REQUEST_ALL_CERTIFICATES_ERROR:
          this.emit(EventTypes.CERTIFICATE_ALL_CERTIFICATES_ERROR, action.data);
          break;
      }
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  fetchCertificates(...args) {
    return CertificateActions.fetchCertificates(...args);
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState()[prop];
  }

  getCertificates() {
    return new CertificatesList({ items: this.get("certificates") });
  }

  processCertificates(response) {
    SDK.getSDK().dispatch({
      type: EventTypes.CERTIFICATE_ALL_CERTIFICATES_SUCCESS,
      certificates: response,
    });

    this.emit(EventTypes.CERTIFICATE_ALL_CERTIFICATES_SUCCESS);
  }
}

export default new CertificateStore();
