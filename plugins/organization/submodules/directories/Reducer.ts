import { ACL_DIRECTORIES_CHANGED } from "./constants/EventTypes";

module.exports = (state = { list: [] }, action) => {
  switch (action.type) {
    case ACL_DIRECTORIES_CHANGED:
      return { ...state, list: action.directories };
    default:
      return state;
  }
};
