import * as EventTypes from "./constants/EventTypes";

const initialState = {
  certificates: [],
  secrets: [],
  stores: [],
  secretDetail: {},
  sealedStores: 0
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case EventTypes.SECRET_ALL_STORES_SUCCESS:
      return { ...state, stores: action.stores };

    case EventTypes.SECRET_STORE_SECRET_SUCCESS:
      const { secretDetail, secretPath, storeName, contentType } = action;
      secretDetail.path = secretPath;
      secretDetail.store = storeName;
      secretDetail.contentType = contentType;

      return { ...state, secretDetail };

    case EventTypes.SECRET_STORE_SECRETS_SUCCESS:
      return { ...state, secrets: action.secrets };

    case EventTypes.CERTIFICATE_ALL_CERTIFICATES_SUCCESS:
      return { ...state, certificates: action.certificates.result };

    default:
      return state;
  }
};
