import * as EventTypes from "./constants/EventTypes";

const SDK = require("../../SDK");

const initialState = {
  serviceAccounts: [],
  serviceAccountsDetail: {},
  serviceAccountsFetching: {}
};

module.exports = (state = initialState, action) => {
  if (action.__origin !== SDK.getSDK().pluginID) {
    return state;
  }

  switch (action.type) {
    case EventTypes.ACL_SERVICE_ACCOUNTS_CHANGE:
      return {
        ...state,
        serviceAccounts: action.serviceAccounts
      };

    case EventTypes.ACL_SERVICE_ACCOUNT_SET_SERVICE_ACCOUNT:
      return {
        ...state,
        serviceAccountsDetail: action.serviceAccounts
      };

    case EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCH_START:
    case EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_SUCCESS:
    case EventTypes.ACL_SERVICE_ACCOUNT_DETAILS_FETCHED_ERROR:
      return {
        ...state,
        serviceAccountsFetching: action.serviceAccountsFetching
      };

    default:
      return state;
  }
};
