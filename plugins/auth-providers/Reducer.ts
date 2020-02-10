import {
  PROVIDER_CALLBACK_URL_SUCCESS,
  PROVIDER_DELETE_SUCCESS,
  PROVIDER_SUCCESS,
  PROVIDERS_CHANGE
} from "./constants/EventTypes";

const initialState = {
  providers: { oidc: {}, saml: {} },
  providerDetail: { oidc: {}, saml: {} }
};

module.exports = (state = initialState, action) => {
  let { callbackURL, provider, providerID, providerType } = action;
  let newProviderTypeDetail, newProviderDetail;

  switch (action.type) {
    case PROVIDER_SUCCESS:
      const prevProvider = state.providerDetail[providerType][providerID] || {};

      provider = { ...prevProvider, ...provider };

      newProviderTypeDetail = {
        ...state.providerDetail[providerType],
        [providerID]: { providerID, ...provider }
      };
      newProviderDetail = {
        ...state.providerDetail,
        [providerType]: newProviderTypeDetail
      };

      return { ...state, providerDetail: newProviderDetail };

    case PROVIDER_CALLBACK_URL_SUCCESS:
      provider = state.providerDetail.saml[providerID] || {};
      provider.callbackURL = callbackURL;
      newProviderDetail = {
        ...state.providerDetail,
        saml: { [providerID]: provider }
      };
      return { ...state, providerDetail: newProviderDetail };

    case PROVIDER_DELETE_SUCCESS:
      const providerDetail = { ...state.providerDetail };
      if (providerID in providerDetail[providerType]) {
        delete providerDetail[providerType][providerID];
      }

      return { ...state, providerDetail };

    case PROVIDERS_CHANGE:
      return { ...state, providers: action.providers };

    default:
      return state;
  }
};
