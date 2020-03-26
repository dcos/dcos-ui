import {
  NETWORKING_BACKEND_CONNECTIONS_CHANGE,
  NETWORKING_NODE_MEMBERSHIP_CHANGE,
  NETWORKING_VIP_DETAIL_CHANGE,
  NETWORKING_VIP_SUMMARIES_CHANGE,
  NETWORKING_VIPS_CHANGE,
} from "./constants/EventTypes";

const initialState = {
  backendConnections: {},
  nodeMemberships: [],
  vips: [],
  vipDetail: {},
  vipSummaries: [],
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case NETWORKING_VIP_DETAIL_CHANGE:
      const { vipDetail } = action;

      return { ...state, vipDetail };

    case NETWORKING_VIPS_CHANGE:
      return { ...state, vips: action.vips };

    case NETWORKING_NODE_MEMBERSHIP_CHANGE:
      const { nodeMemberships } = action;

      return { ...state, nodeMemberships };

    case NETWORKING_BACKEND_CONNECTIONS_CHANGE:
      const { backendConnections } = action;

      return { ...state, backendConnections };

    case NETWORKING_VIP_SUMMARIES_CHANGE:
      const { vipSummaries } = action;

      return { ...state, vipSummaries };

    default:
      return state;
  }
};
