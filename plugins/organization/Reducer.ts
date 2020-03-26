import aclReducer from "./submodules/acl/Reducer";
import directoriesReducer from "./submodules/directories/Reducer";
import groupsReducer from "./submodules/groups/Reducer";
import serviceAccountsReducer from "./submodules/service-accounts/Reducer";
import usersReducer from "./submodules/users/Reducer";

module.exports = (state = {}, action) => ({
  acl: aclReducer(state.acl, action),
  directories: directoriesReducer(state.directories, action),
  groups: groupsReducer(state.groups, action),
  serviceAccounts: serviceAccountsReducer(state.serviceAccounts, action),
  users: usersReducer(state.users, action),
});
