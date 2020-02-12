import Config from "#SRC/js/config/Config";
import { RequestUtil } from "mesosphere-shared-reactjs";
import {
  REQUEST_CLUSTER_LIST_SUCCESS,
  REQUEST_CLUSTER_LIST_ERROR
} from "../constants/ActionTypes";

import SDK from "PluginSDK";

const ClusterLinkingActions = {
  fetchClusterLinkingList() {
    RequestUtil.json({
      method: "GET",
      url: `${Config.rootUrl}/cluster/v1/links`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_CLUSTER_LIST_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_CLUSTER_LIST_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const clusterListFixtureImportPromise = import(
    /* clusterListFixture */ "../../../tests/_fixtures/cluster-linking/cluster-list.json"
  );

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  clusterListFixtureImportPromise.then(clusterListFixture => {
    window.actionTypes.ClusterLinkingActions = {
      fetchClusterLinkingList: {
        event: "success",
        success: { response: clusterListFixture }
      }
    };

    Object.keys(window.actionTypes.ClusterLinkingActions).forEach(method => {
      ClusterLinkingActions[method] = RequestUtil.stubRequest(
        ClusterLinkingActions,
        "ClusterLinkingActions",
        method
      );
    });
  });
}

export default ClusterLinkingActions;
