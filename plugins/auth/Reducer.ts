import { ACL_AUTH_USER_PERMISSIONS_CHANGED } from "./constants/EventTypes";

const initialState = {
  permissions: { direct: [], groups: [] }
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case ACL_AUTH_USER_PERMISSIONS_CHANGED:
      return { ...state, permissions: action.permissions };
    default:
      return state;
  }
};
