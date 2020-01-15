import isEqual from "lodash.isequal";
import PluginSDK from "PluginSDK";

import {
  REQUEST_DCOS_METADATA,
  REQUEST_DCOS_BUILD_INFO_ERROR,
  REQUEST_DCOS_BUILD_INFO_SUCCESS,
  REQUEST_METADATA,
  SERVER_ACTION
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import Config from "../config/Config";
import {
  DCOS_METADATA_CHANGE,
  DCOS_BUILD_INFO_ERROR,
  DCOS_BUILD_INFO_CHANGE,
  METADATA_CHANGE
} from "../constants/EventTypes";
import GetSetBaseStore from "./GetSetBaseStore";
import MetadataActions from "../events/MetadataActions";

class MetadataStore extends GetSetBaseStore {
  storeID = "metadata";

  constructor(...args) {
    super(...args);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: METADATA_CHANGE,
        dcosSuccess: DCOS_METADATA_CHANGE,
        dcosBuildInfoChange: DCOS_BUILD_INFO_CHANGE,
        dcosBuildInfoError: DCOS_BUILD_INFO_ERROR
      },
      unmountWhen: () => false
    });

    AppDispatcher.register(payload => {
      const source = payload.source;
      if (source !== SERVER_ACTION) {
        return false;
      }

      const action = payload.action;

      switch (action.type) {
        case REQUEST_METADATA:
          const oldMetadata = this.get("metadata");
          const metadata = action.data;

          // only emitting on change
          if (!isEqual(oldMetadata, metadata)) {
            this.set({ metadata });
            this.emitChange(METADATA_CHANGE);
          }
          break;
        case REQUEST_DCOS_METADATA:
          const oldDCOSMetadata = this.get("dcosMetadata");
          const dcosMetadata = action.data;

          // only emitting on change
          if (!isEqual(oldDCOSMetadata, dcosMetadata)) {
            this.set({ dcosMetadata });
            this.emitChange(DCOS_METADATA_CHANGE);
          }
          break;
        case REQUEST_DCOS_BUILD_INFO_ERROR:
          this.emitChange(DCOS_BUILD_INFO_ERROR);
          break;
        case REQUEST_DCOS_BUILD_INFO_SUCCESS:
          const prevDCOSBuildInfo = this.get("dcosBuildInfo");
          const nextDCOSBuildInfo = action.data;

          if (!isEqual(prevDCOSBuildInfo, nextDCOSBuildInfo)) {
            this.set({ dcosBuildInfo: nextDCOSBuildInfo });
            this.emitChange(DCOS_BUILD_INFO_CHANGE);
          }

          break;
      }

      return true;
    });
  }

  init() {
    this.set({
      metadata: {},
      dcosBuildInfo: null
    });

    MetadataActions.fetch();
  }

  // TODO: DCOS-7430 - Remove emitChange method
  emitChange(eventName) {
    this.emit(eventName);
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  buildDocsURI(path) {
    return `${Config.documentationURI}/${this.parsedVersion}${path}`;
  }

  fetchDCOSBuildInfo() {
    MetadataActions.fetchDCOSBuildInfo();
  }

  get bootstrapId() {
    const metadata = this.get("dcosMetadata");

    return metadata && metadata["bootstrap-id"];
  }

  get clusterId() {
    const metadata = this.get("metadata");

    return metadata && metadata.CLUSTER_ID;
  }

  get imageCommit() {
    const metadata = this.get("dcosMetadata");

    return metadata && metadata["dcos-image-commit"];
  }

  get variant() {
    const metadata = this.get("dcosMetadata");

    return metadata && metadata["dcos-variant"];
  }

  get version() {
    const metadata = this.get("dcosMetadata");

    return metadata && metadata.version;
  }

  get parsedVersion() {
    let version = this.version || "latest";
    version = version.split("-")[0];

    return version.replace(/(.*?)\.(.*?)\..*/, "$1.$2");
  }
}

export default new MetadataStore();
