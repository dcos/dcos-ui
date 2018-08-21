import PluginSDK from "PluginSDK";

import GetSetBaseStore from "./GetSetBaseStore";
import AppDispatcher from "../events/AppDispatcher";
import CosmosPackagesActions from "../events/CosmosPackagesActions";
import {
  COSMOS_PACKAGE_DESCRIBE_CHANGE,
  COSMOS_PACKAGE_DESCRIBE_ERROR,
  COSMOS_SERVICE_DESCRIBE_CHANGE,
  COSMOS_SERVICE_DESCRIBE_ERROR,
  COSMOS_SERVICE_UPDATE_SUCCESS,
  COSMOS_SERVICE_UPDATE_ERROR,
  COSMOS_LIST_VERSIONS_CHANGE,
  COSMOS_LIST_VERSIONS_ERROR,
  COSMOS_INSTALL_ERROR,
  COSMOS_INSTALL_SUCCESS,
  COSMOS_LIST_CHANGE,
  COSMOS_LIST_ERROR,
  COSMOS_SEARCH_CHANGE,
  COSMOS_SEARCH_ERROR,
  COSMOS_UNINSTALL_ERROR,
  COSMOS_UNINSTALL_SUCCESS,
  COSMOS_REPOSITORIES_ERROR,
  COSMOS_REPOSITORIES_SUCCESS,
  COSMOS_REPOSITORY_ADD_ERROR,
  COSMOS_REPOSITORY_ADD_SUCCESS,
  COSMOS_REPOSITORY_DELETE_ERROR,
  COSMOS_REPOSITORY_DELETE_SUCCESS
} from "../constants/EventTypes";
import {
  REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR,
  REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
  REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_ERROR,
  REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS,
  REQUEST_COSMOS_PACKAGE_INSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
  REQUEST_COSMOS_PACKAGES_LIST_ERROR,
  REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
  REQUEST_COSMOS_PACKAGES_SEARCH_ERROR,
  REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
  REQUEST_COSMOS_REPOSITORIES_LIST_ERROR,
  REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS,
  REQUEST_COSMOS_REPOSITORY_ADD_ERROR,
  REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS,
  REQUEST_COSMOS_REPOSITORY_DELETE_ERROR,
  REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS,
  REQUEST_COSMOS_SERVICE_DESCRIBE_SUCCESS,
  REQUEST_COSMOS_SERVICE_DESCRIBE_ERROR,
  REQUEST_COSMOS_SERVICE_UPDATE_SUCCESS,
  REQUEST_COSMOS_SERVICE_UPDATE_ERROR,
  SERVER_ACTION
} from "../constants/ActionTypes";
import RepositoryList from "../structs/RepositoryList";
import UniverseInstalledPackagesList from "../structs/UniverseInstalledPackagesList";
import UniversePackage from "../structs/UniversePackage";
import UniversePackageVersions from "../structs/UniversePackageVersions";
import UniversePackagesList from "../structs/UniversePackagesList";

class CosmosPackagesStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      availablePackages: [],
      packagesVersions: {},
      packageImages: {},
      packageDetails: null,
      serviceDetails: null,
      packageVersions: null,
      installedPackages: [],
      repositories: []
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        availableError: COSMOS_SEARCH_ERROR,
        availableSuccess: COSMOS_SEARCH_CHANGE,
        packageDescriptionSuccess: COSMOS_PACKAGE_DESCRIBE_CHANGE,
        packageDescriptionError: COSMOS_PACKAGE_DESCRIBE_ERROR,
        listVersionsSuccess: COSMOS_LIST_VERSIONS_CHANGE,
        listVersionsError: COSMOS_LIST_VERSIONS_ERROR,
        installedSuccess: COSMOS_LIST_CHANGE,
        installedError: COSMOS_LIST_ERROR,

        installError: COSMOS_INSTALL_ERROR,
        installSuccess: COSMOS_INSTALL_SUCCESS,
        uninstallError: COSMOS_UNINSTALL_ERROR,
        uninstallSuccess: COSMOS_UNINSTALL_SUCCESS,

        repositoriesSuccess: COSMOS_REPOSITORIES_SUCCESS,
        repositoriesError: COSMOS_REPOSITORIES_ERROR,
        repositoryAddSuccess: COSMOS_REPOSITORY_ADD_SUCCESS,
        repositoryAddError: COSMOS_REPOSITORY_ADD_ERROR,
        repositoryDeleteSuccess: COSMOS_REPOSITORY_DELETE_SUCCESS,
        repositoryDeleteError: COSMOS_REPOSITORY_DELETE_ERROR,

        serviceDescriptionSuccess: COSMOS_SERVICE_DESCRIBE_CHANGE,
        serviceDescriptionError: COSMOS_SERVICE_DESCRIBE_ERROR,

        serviceUpdateSuccess: COSMOS_SERVICE_UPDATE_SUCCESS,
        serviceUpdateError: COSMOS_SERVICE_UPDATE_ERROR
      },
      unmountWhen(store, event) {
        return event === "availableSuccess";
      },
      listenAlways: false
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      const source = payload.source;
      if (source !== SERVER_ACTION) {
        return false;
      }

      const action = payload.action;
      const data = action.data;

      switch (action.type) {
        case REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS:
          this.processPackageDescriptionSuccess(
            data,
            action.packageName,
            action.packageVersion
          );
          break;
        case REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR:
          this.processPackageDescriptionError(
            data,
            action.packageName,
            action.packageVersion
          );
          break;
        case REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_SUCCESS:
          this.processPackageListVersionsSuccess(data, action.packageName);
          break;
        case REQUEST_COSMOS_PACKAGE_LIST_VERSIONS_ERROR:
          this.processPackageListVersionsError(data, action.packageName);
          break;
        case REQUEST_COSMOS_PACKAGES_LIST_SUCCESS:
          this.processInstalledPackagesSuccess(
            data,
            action.packageName,
            action.appId
          );
          break;
        case REQUEST_COSMOS_PACKAGES_LIST_ERROR:
          this.processInstalledPackagesError(
            data,
            action.packageName,
            action.appId
          );
          break;
        case REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS:
          this.processPackageImagesSuccess(data.images);
          this.processAvailablePackagesSuccess(data.packages, action.query);
          break;
        case REQUEST_COSMOS_PACKAGES_SEARCH_ERROR:
          this.processAvailablePackagesError(data, action.query);
          break;
        case REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS:
          this.emit(
            COSMOS_INSTALL_SUCCESS,
            action.packageName,
            action.packageVersion,
            data.appId
          );
          break;
        case REQUEST_COSMOS_PACKAGE_INSTALL_ERROR:
          this.emit(
            COSMOS_INSTALL_ERROR,
            data,
            action.packageName,
            action.packageVersion
          );
          break;
        case REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS:
          this.emit(
            COSMOS_UNINSTALL_SUCCESS,
            action.packageName,
            action.packageVersion,
            action.appId
          );
          break;
        case REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR:
          this.emit(
            COSMOS_UNINSTALL_ERROR,
            data,
            action.packageName,
            action.packageVersion,
            action.appId
          );
          break;
        case REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS:
          this.processRepositoriesSuccess(data);
          break;
        case REQUEST_COSMOS_REPOSITORIES_LIST_ERROR:
          this.emit(COSMOS_REPOSITORIES_ERROR, data);
          break;
        case REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS:
          this.emit(
            COSMOS_REPOSITORY_ADD_SUCCESS,
            data,
            action.name,
            action.uri
          );
          break;
        case REQUEST_COSMOS_REPOSITORY_ADD_ERROR:
          this.emit(COSMOS_REPOSITORY_ADD_ERROR, data, action.name, action.uri);
          break;
        case REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS:
          this.emit(
            COSMOS_REPOSITORY_DELETE_SUCCESS,
            data,
            action.name,
            action.uri
          );
          break;
        case REQUEST_COSMOS_REPOSITORY_DELETE_ERROR:
          this.emit(
            COSMOS_REPOSITORY_DELETE_ERROR,
            data,
            action.name,
            action.uri
          );
          break;
        case REQUEST_COSMOS_SERVICE_DESCRIBE_SUCCESS:
          this.processServiceDescriptionSuccess(data, action.serviceId);
          break;
        case REQUEST_COSMOS_SERVICE_DESCRIBE_ERROR:
          this.processServiceDescriptionError(data, action.serviceId);
          break;
        case REQUEST_COSMOS_SERVICE_UPDATE_SUCCESS:
          this.emit(COSMOS_SERVICE_UPDATE_SUCCESS);
          break;
        case REQUEST_COSMOS_SERVICE_UPDATE_ERROR:
          this.emit(COSMOS_SERVICE_UPDATE_ERROR, data);
          break;
      }

      return true;
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  /* API */
  fetchAvailablePackages() {
    return CosmosPackagesActions.fetchAvailablePackages(...arguments);
  }

  fetchInstalledPackages() {
    return CosmosPackagesActions.fetchInstalledPackages(...arguments);
  }

  fetchPackageDescription() {
    return CosmosPackagesActions.fetchPackageDescription(...arguments);
  }

  fetchPackageVersions() {
    return CosmosPackagesActions.fetchPackageVersions(...arguments);
  }

  fetchServiceDescription() {
    return CosmosPackagesActions.fetchServiceDescription(...arguments);
  }

  installPackage() {
    return CosmosPackagesActions.installPackage(...arguments);
  }

  uninstallPackage() {
    return CosmosPackagesActions.uninstallPackage(...arguments);
  }

  fetchRepositories() {
    return CosmosPackagesActions.fetchRepositories(...arguments);
  }

  addRepository() {
    return CosmosPackagesActions.addRepository(...arguments);
  }

  deleteRepository() {
    return CosmosPackagesActions.deleteRepository(...arguments);
  }

  updateService() {
    return CosmosPackagesActions.updateService(...arguments);
  }

  /* Reducers */
  getAvailablePackages() {
    return new UniversePackagesList({ items: this.get("availablePackages") });
  }

  getInstalledPackages() {
    return new UniverseInstalledPackagesList({
      items: this.get("installedPackages")
    });
  }

  getPackageDetails() {
    const packageDetails = this.get("packageDetails");
    if (packageDetails) {
      return new UniversePackage(packageDetails);
    }

    return null;
  }

  getPackageImages() {
    return this.get("packageImages");
  }

  getServiceDetails() {
    return this.get("serviceDetails");
  }

  getPackageVersions(packageName) {
    const packagesVersions = this.get("packagesVersions");
    if (packagesVersions && packagesVersions[packageName]) {
      return new UniversePackageVersions(packagesVersions[packageName]);
    }

    return null;
  }

  getRepositories() {
    return new RepositoryList({ items: this.get("repositories") });
  }

  processAvailablePackagesSuccess(packages, query) {
    this.set({ availablePackages: packages });

    this.emit(COSMOS_SEARCH_CHANGE, query);
  }

  processPackageImagesSuccess(packageImages) {
    this.set({ packageImages });
  }

  processAvailablePackagesError(error, query) {
    this.emit(COSMOS_SEARCH_ERROR, error, query);
  }

  processInstalledPackagesSuccess(packages, name, appId) {
    this.set({ installedPackages: packages });

    this.emit(COSMOS_LIST_CHANGE, name, appId);
  }

  processInstalledPackagesError(error, name, appId) {
    this.emit(COSMOS_LIST_ERROR, error, name, appId);
  }

  processPackageDescriptionSuccess(cosmosPackage, name, version) {
    this.set({ packageDetails: cosmosPackage });

    this.emit(COSMOS_PACKAGE_DESCRIBE_CHANGE, name, version);
  }

  processPackageDescriptionError(error, name, version) {
    this.set({ packageDetails: null });

    this.emit(COSMOS_PACKAGE_DESCRIBE_ERROR, error, name, version);
  }

  processPackageListVersionsSuccess(packageVersions, packageName) {
    const packagesVersions = Object.assign({}, this.get("packagesVersions"), {
      [packageName]: {
        packageVersions
      }
    });

    this.set({ packagesVersions });

    this.emit(COSMOS_LIST_VERSIONS_CHANGE, packageName);
  }

  processPackageListVersionsError(error, packageName) {
    const packagesVersions = Object.assign({}, this.get("packagesVersions"), {
      [packageName]: null
    });

    this.set({ packagesVersions });

    this.emit(COSMOS_LIST_VERSIONS_ERROR, error);
  }

  processRepositoriesSuccess(repositories) {
    this.set({ repositories });

    this.emit(COSMOS_REPOSITORIES_SUCCESS);
  }

  processServiceDescriptionSuccess(cosmosPackage, name) {
    this.set({ serviceDetails: cosmosPackage });

    this.emit(COSMOS_SERVICE_DESCRIBE_CHANGE, name);
  }

  processServiceDescriptionError(error, name) {
    this.set({ serviceDetails: null });

    this.emit(COSMOS_SERVICE_DESCRIBE_ERROR, error, name);
  }

  get storeID() {
    return "cosmosPackages";
  }
}

module.exports = new CosmosPackagesStore();
