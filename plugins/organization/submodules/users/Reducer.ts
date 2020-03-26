import {
  ACL_USER_SET_USER,
  ACL_USERS_CHANGE,
  ACL_USER_DETAILS_FETCH_START,
  ACL_USER_DETAILS_FETCHED_SUCCESS,
  ACL_USER_DETAILS_FETCHED_ERROR,
} from "./constants/EventTypes";

const initialState = {
  users: [],
  userDetail: {},
  usersFetching: {},
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case ACL_USERS_CHANGE:
      return { ...state, users: action.users };

    case ACL_USER_SET_USER:
      return { ...state, userDetail: action.users };

    case ACL_USER_DETAILS_FETCH_START:
    case ACL_USER_DETAILS_FETCHED_SUCCESS:
    case ACL_USER_DETAILS_FETCHED_ERROR:
      return { ...state, usersFetching: action.usersFetching };

    default:
      return state;
  }
};
