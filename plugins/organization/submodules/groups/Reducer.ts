import {
  ACL_GROUPS_CHANGE,
  ACL_GROUP_SET_GROUPS,
  ACL_GROUP_SET_GROUPS_FETCHING
} from "./constants/EventTypes";

const initialState = {
  groups: [],
  groupDetail: {},
  groupsFetching: {}
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case ACL_GROUPS_CHANGE:
      return { ...state, groups: action.groups };

    case ACL_GROUP_SET_GROUPS:
      return { ...state, groupDetail: action.groups };

    case ACL_GROUP_SET_GROUPS_FETCHING:
      return { ...state, groupsFetching: action.groupsFetching };

    default:
      return state;
  }
};
