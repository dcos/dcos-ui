import {
  ACL_RESOURCE_ACLS_CHANGE,
  ACL_SCHEMA_CHANGE
} from "./constants/EventTypes";

module.exports = (state = {}, action) => {
  switch (action.type) {
    case ACL_RESOURCE_ACLS_CHANGE:
      return { ...state, ...action.data };
    case ACL_SCHEMA_CHANGE:
      return { ...state, ...action.data };
    default:
      return state;
  }
};
