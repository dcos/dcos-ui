import SDK from "./SDK";

module.exports = (PluginSDK) => {
  SDK.setSDK(PluginSDK);

  const PluginHooks = require("./hooks");

  // Set plugin's hooks before submodules to ensure routes are defined
  PluginHooks.initialize();

  const DirectoriesHooks = require("./submodules/directories/hooks");
  const GroupsHooks = require("./submodules/groups/hooks");
  const OrganizationReducer = require("./Reducer");
  const ServiceAccountsHooks = require("./submodules/service-accounts/hooks");
  const UsersHooks = require("./submodules/users/hooks");

  // Set submodule hooks
  DirectoriesHooks.initialize();
  GroupsHooks.initialize();
  ServiceAccountsHooks.initialize();
  UsersHooks.initialize();

  return OrganizationReducer;
};
