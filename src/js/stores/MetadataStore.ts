import isEqual from "lodash.isequal";
import PluginSDK from "PluginSDK";

import {
  REQUEST_DCOS_METADATA,
  REQUEST_DCOS_BUILD_INFO_ERROR,
  REQUEST_DCOS_BUILD_INFO_SUCCESS,
  REQUEST_METADATA,
} from "../constants/ActionTypes";
import AppDispatcher from "../events/AppDispatcher";
import {
  DCOS_METADATA_CHANGE,
  DCOS_BUILD_INFO_ERROR,
  DCOS_BUILD_INFO_CHANGE,
  METADATA_CHANGE,
} from "../constants/EventTypes";
import GetSetBaseStore from "./GetSetBaseStore";
import MetadataActions from "../events/MetadataActions";

class MetadataStore extends GetSetBaseStore {
  storeID = "metadata";

  constructor() {
    super();

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: METADATA_CHANGE,
        dcosSuccess: DCOS_METADATA_CHANGE,
        dcosBuildInfoChange: DCOS_BUILD_INFO_CHANGE,
        dcosBuildInfoError: DCOS_BUILD_INFO_ERROR,
      },
      unmountWhen: () => false,
    });

    AppDispatcher.register((payload) => {
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
          const oldDCOSMetadata = this.dcosMetadata;
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
    this.set({ metadata: {}, dcosBuildInfo: null });
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
    return `https://docs.d2iq.com/mesosphere/dcos/${this.parsedVersion}${path}`;
  }

  fetchDCOSBuildInfo() {
    MetadataActions.fetchDCOSBuildInfo();
  }

  get bootstrapId() {
    return this.dcosMetadata?.["bootstrap-id"];
  }

  get clusterId() {
    return this.metadata?.CLUSTER_ID;
  }

  get imageCommit() {
    return this.dcosMetadata?.["dcos-image-commit"];
  }

  get variant() {
    return this.dcosMetadata?.["dcos-variant"];
  }

  get version() {
    return this.dcosMetadata?.version;
  }

  get parsedVersion() {
    return (this.version || "latest")
      .split("-")[0]
      .replace(/(.*?)\.(.*?)\..*/, "$1.$2");
  }
}

export default new MetadataStore();
