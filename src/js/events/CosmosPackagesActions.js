import { RequestUtil } from "mesosphere-shared-reactjs";
import * as repositoriesStream from "#PLUGINS/catalog/src/js/repositories/data/packageRepositoryClient";

import {
  REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
  REQUEST_COSMOS_PACKAGES_SEARCH_ERROR,
  REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
  REQUEST_COSMOS_PACKAGES_LIST_ERROR,
  REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR,
  REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
  REQUEST_COSMOS_PACKAGE_INSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
  REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS,
  REQUEST_COSMOS_REPOSITORIES_LIST_ERROR,
  REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS,
  REQUEST_COSMOS_REPOSITORY_ADD_ERROR,
  REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS,
  REQUEST_COSMOS_REPOSITORY_DELETE_ERROR,
  REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS,
  REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_ERROR,
  REQUEST_COSMOS_SERVICE_DESCRIBE_SUCCESS,
  REQUEST_COSMOS_SERVICE_DESCRIBE_ERROR,
  REQUEST_COSMOS_SERVICE_UPDATE_SUCCESS,
  REQUEST_COSMOS_SERVICE_UPDATE_ERROR
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import Util from "../utils/Util";

function getContentType({ action, actionType, entity, version }) {
  return `application/vnd.dcos.${entity}.${action}-${actionType}+json;charset=utf-8;version=${version}`;
}

function getErrorMessage(response = {}) {
  if (typeof response === "string") {
    return response;
  }

  return response.description || response.message || "An error has occurred.";
}

const CosmosPackagesActions = {
  fetchAvailablePackages(query) {
    RequestUtil.json({
      contentType: getContentType({
        action: "search",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "search",
          actionType: "response",
          entity: "package",
          version: "v1"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}${Config.cosmosAPIPrefix}/search`,
      data: JSON.stringify({ query }),
      success(response) {
        const packages = response.packages || [];
        const data = packages.map(function(cosmosPackage) {
          if (!cosmosPackage.resource) {
            cosmosPackage.resource = {};
          }

          if (cosmosPackage.images) {
            cosmosPackage.resource.images = cosmosPackage.images;
            delete cosmosPackage.images;
          }

          return cosmosPackage;
        });
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
          data,
          query
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_SEARCH_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          query,
          xhr
        });
      }
    });
  },

  fetchInstalledPackages(packageName, appId) {
    RequestUtil.json({
      contentType: getContentType({
        action: "list",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "list",
          actionType: "response",
          entity: "package",
          version: "v1"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}${Config.cosmosAPIPrefix}/list`,
      data: JSON.stringify({ packageName, appId }),
      success(response) {
        const packages = response.packages || [];
        // Map list data to match other endpoint structures
        const data = packages.map(function(item) {
          const cosmosPackage =
            Util.findNestedPropertyInObject(
              item,
              "packageInformation.packageDefinition"
            ) || {};
          cosmosPackage.appId = item.appId;
          cosmosPackage.resource =
            Util.findNestedPropertyInObject(
              item,
              "packageInformation.resourceDefinition"
            ) || {};

          if (cosmosPackage.images) {
            cosmosPackage.resource.images = cosmosPackage.images;
            delete cosmosPackage.images;
          }

          if (!cosmosPackage.currentVersion && cosmosPackage.version) {
            cosmosPackage.currentVersion = cosmosPackage.version;
            delete cosmosPackage.version;
          }

          return cosmosPackage;
        });

        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
          data,
          packageName,
          appId
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_LIST_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          packageName,
          appId,
          xhr
        });
      }
    });
  },

  fetchPackageDescription(packageName, packageVersion) {
    RequestUtil.json({
      contentType: getContentType({
        action: "describe",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "describe",
          actionType: "response",
          entity: "package",
          version: "v3"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}${Config.cosmosAPIPrefix}/describe`,
      data: JSON.stringify({ packageName, packageVersion }),
      success(response) {
        const cosmosPackage = response.package;

        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
          data: cosmosPackage,
          packageName,
          packageVersion
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          packageName,
          packageVersion,
          xhr
        });
      }
    });
  },

  fetchServiceDescription(serviceId) {
    RequestUtil.json({
      contentType: getContentType({
        action: "describe",
        actionType: "request",
        entity: "service",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "describe",
          actionType: "response",
          entity: "service",
          version: "v1"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}/cosmos/service/describe`,
      data: JSON.stringify({ appId: serviceId }),
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_SERVICE_DESCRIBE_SUCCESS,
          data: response,
          serviceId
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_SERVICE_DESCRIBE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceId,
          xhr
        });
      }
    });
  },

  updateService(serviceId, options) {
    RequestUtil.json({
      contentType: getContentType({
        action: "update",
        actionType: "request",
        entity: "service",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "update",
          actionType: "response",
          entity: "service",
          version: "v1"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}/cosmos/service/update`,
      data: JSON.stringify({ appId: serviceId, options, replace: true }),
      success() {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_SERVICE_UPDATE_SUCCESS
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_SERVICE_UPDATE_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          xhr
        });
      }
    });
  },

  fetchPackageVersions(packageName) {
    // necessary for the backend
    // even though it's not in use
    const includePackageVersions = false;

    RequestUtil.json({
      contentType: getContentType({
        action: "list-versions",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "list-versions",
          actionType: "response",
          entity: "package",
          version: "v1"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}${Config.cosmosAPIPrefix}/list-versions`,
      data: JSON.stringify({ packageName, includePackageVersions }),
      success(response) {
        const packageVersions = response.results;

        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS,
          data: packageVersions,
          packageName
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          packageName,
          xhr
        });
      }
    });
  },

  installPackage(packageName, packageVersion, options = {}) {
    RequestUtil.json({
      contentType: getContentType({
        action: "install",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "install",
          actionType: "response",
          entity: "package",
          version: "v2"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}${Config.cosmosAPIPrefix}/install`,
      data: JSON.stringify({ packageName, packageVersion, options }),
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS,
          data: response,
          packageName,
          packageVersion
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_INSTALL_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          packageName,
          packageVersion,
          xhr
        });
      }
    });
  },

  uninstallPackage(packageName, appId, all = false) {
    RequestUtil.json({
      contentType: getContentType({
        action: "uninstall",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      headers: {
        Accept: getContentType({
          action: "uninstall",
          actionType: "response",
          entity: "package",
          version: "v1"
        })
      },
      method: "POST",
      url: `${Config.rootUrl}${Config.cosmosAPIPrefix}/uninstall`,
      data: JSON.stringify({ packageName, appId, all }),
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
          data: response,
          packageName,
          appId
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
          data: RequestUtil.parseResponseBody(xhr),
          packageName,
          appId,
          xhr
        });
      }
    });
  },

  fetchRepositories(type) {
    repositoriesStream.fetchRepositories(type).subscribe(
      function success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS,
          data: response.repositories
        });
      },
      function error({ response }) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORIES_LIST_ERROR,
          data: getErrorMessage(response)
        });
      }
    );
  },

  addRepository(name, uri, index) {
    console.warn("DEPRECATED", "use the new data-layer approach");
    repositoriesStream.addRepository(name, uri, index).subscribe(
      function success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS,
          data: response,
          name,
          uri
        });
      },
      function error({ response }) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_ADD_ERROR,
          data: getErrorMessage(response),
          name,
          uri
        });
      }
    );
  },

  deleteRepository(name, uri) {
    console.warn("DEPRECATED", "use the new data-layer approach");
    repositoriesStream.deleteRepository(name, uri).subscribe(
      function success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS,
          data: response,
          name,
          uri
        });
      },
      function error({ response }) {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_DELETE_ERROR,
          data: getErrorMessage(response),
          name,
          uri
        });
      }
    );
  }
};

if (Config.useFixtures) {
  const packageDescribeFixture = require("../../../tests/_fixtures/cosmos/package-describe.json");
  const serviceDescribeFixture = require("../../../tests/_fixtures/cosmos/service-describe.json");
  const packagesListFixture = require("../../../tests/_fixtures/cosmos/packages-list.json");
  const packagesSearchFixture = require("../../../tests/_fixtures/cosmos/packages-search.json");
  const packagesRepositoriesFixture = require("../../../tests/_fixtures/cosmos/packages-repositories.json");
  const packageListVersionsFixture = require("../../../tests/_fixtures/cosmos/package-list-versions.json");

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.CosmosPackagesActions = {
    fetchPackageDescription: {
      event: "success",
      success: { response: packageDescribeFixture }
    },
    fetchPackageVersions: {
      event: "success",
      success: { response: packageListVersionsFixture }
    },
    fetchServiceDescription: {
      event: "success",
      success: { response: serviceDescribeFixture }
    },
    fetchInstalledPackages: {
      event: "success",
      success: { response: packagesListFixture }
    },
    fetchAvailablePackages: {
      event: "success",
      success: { response: packagesSearchFixture }
    },
    updateService: { event: "success" },
    installPackage: { event: "success" },
    uninstallPackage: { event: "success" },
    fetchRepositories: {
      event: "success",
      success: { response: packagesRepositoriesFixture }
    },
    addRepository: { event: "success" },
    deleteRepository: { event: "success" }
  };

  Object.keys(global.actionTypes.CosmosPackagesActions).forEach(function(
    method
  ) {
    CosmosPackagesActions[method] = RequestUtil.stubRequest(
      CosmosPackagesActions,
      "CosmosPackagesActions",
      method
    );
  });
}

module.exports = CosmosPackagesActions;
