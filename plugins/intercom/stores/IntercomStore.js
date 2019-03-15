import PluginSDK from "PluginSDK";

import GetSetBaseStore from "#SRC/js/stores/GetSetBaseStore";
import {
  DCOS_METADATA_CHANGE,
  METADATA_CHANGE,
  HEALTH_NODES_CHANGE,
  CLUSTER_CCID_SUCCESS
} from "#SRC/js/constants/EventTypes";
import AuthStore from "#SRC/js/stores/AuthStore";
import ConfigStore from "#SRC/js/stores/ConfigStore";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import NodeHealthStore from "../../nodes/src/js/stores/NodeHealthStore";

import { INTERCOM_CHANGE } from "../constants/EventTypes";

const METHODS_TO_BIND = [
  "onDCOSMetadataChange",
  "onMetadataChange",
  "onHealthNodesChange",
  "onClusterCCIDSuccess"
];
class IntercomStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        intercomChange: INTERCOM_CHANGE
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  removeStoreListeners() {
    MetadataStore.removeChangeListener(
      DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    MetadataStore.removeChangeListener(METADATA_CHANGE, this.onMetadataChange);

    ConfigStore.removeChangeListener(
      CLUSTER_CCID_SUCCESS,
      this.onClusterCCIDSuccess
    );
  }

  removeChangeListener(eventName, callback) {
    if (this.listenerCount(INTERCOM_CHANGE) > 0) {
      this.removeStoreListeners();
    }

    this.removeListener(eventName, callback);
  }

  addStoreListeners() {
    MetadataStore.addChangeListener(
      DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    MetadataStore.addChangeListener(METADATA_CHANGE, this.onMetadataChange);

    NodeHealthStore.addChangeListener(
      HEALTH_NODES_CHANGE,
      this.onHealthNodesChange
    );

    ConfigStore.addChangeListener(
      CLUSTER_CCID_SUCCESS,
      this.onClusterCCIDSuccess
    );
  }

  addChangeListener(eventName, callback) {
    if (this.listenerCount(INTERCOM_CHANGE) === 0) {
      this.addStoreListeners();
    }

    this.on(eventName, callback);
  }

  onDCOSMetadataChange() {
    this.set({
      bootstrap_id: MetadataStore.bootstrapId,
      dcos_image_commit: MetadataStore.imageCommit,
      dcos_variant: MetadataStore.variant,
      dcos_version: MetadataStore.version
    });

    this.emit(INTERCOM_CHANGE);
  }

  onMetadataChange() {
    this.set({ cluster_id: MetadataStore.clusterId });

    this.emit(INTERCOM_CHANGE);
  }

  removeHealthNodeChangeListener() {
    NodeHealthStore.removeChangeListener(
      HEALTH_NODES_CHANGE,
      this.onHealthNodesChange
    );
  }

  onHealthNodesChange() {
    const activeNodes = NodeHealthStore.getNodes().getItems();
    this.set({ active_nodes: activeNodes.length });

    this.emit(INTERCOM_CHANGE);

    this.removeHealthNodeChangeListener();
  }

  onClusterCCIDSuccess() {
    const user = AuthStore.getUser();
    const ccid = ConfigStore.get("ccid");

    this.set({
      crypto_cluster_uuid: ccid.zbase32_public_key,
      user_id: `${user.uid}+${ccid.zbase32_public_key}`
    });

    this.emit(INTERCOM_CHANGE);
  }

  addAttribute(key, value) {
    this.set({ [key]: value });

    this.emit(INTERCOM_CHANGE);
  }

  get attributes() {
    return this.getSet_data;
  }

  get storeID() {
    return "intercom";
  }
}

export default new IntercomStore();
