import BaseStore from "#SRC/js/stores/BaseStore";
import ClusterLinkingActions from "../actions/ClusterLinkingActions";
import Cluster from "../structs/Cluster";

import {
  REQUEST_CLUSTER_LIST_SUCCESS,
  REQUEST_CLUSTER_LIST_ERROR,
} from "../constants/ActionTypes";
import {
  CLUSTER_LIST_SUCCESS,
  CLUSTER_LIST_ERROR,
} from "../constants/EventTypes";

const SDK = require("../SDK");

class ClusterLinkingStore extends BaseStore {
  constructor(...args) {
    super(...args);

    this.clusters = [];

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "cluster-linking",
      events: {
        clusterListSuccess: CLUSTER_LIST_SUCCESS,
        clusterListError: CLUSTER_LIST_ERROR,
      },
      unmountWhen: () => false,
    });

    SDK.getSDK().onDispatch((action) => {
      const data = action.data;

      switch (action.type) {
        case REQUEST_CLUSTER_LIST_SUCCESS:
          this.processClusterListSuccess(data);
          break;
        case REQUEST_CLUSTER_LIST_ERROR:
          this.processClusterListError(data);
          break;
      }
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  fetchClusterLinkingList() {
    ClusterLinkingActions.fetchClusterLinkingList();
  }

  getLinkedClusters() {
    return this.clusters.map((cluster) => new Cluster(cluster));
  }

  processClusterListSuccess(cluster) {
    if (Array.isArray(cluster.links)) {
      this.clusters = cluster.links;
    }
    this.emit(CLUSTER_LIST_SUCCESS);
  }

  processClusterListError(data) {
    this.clusters = [];
    this.emit(CLUSTER_LIST_ERROR, data);
  }
}

export default new ClusterLinkingStore();
