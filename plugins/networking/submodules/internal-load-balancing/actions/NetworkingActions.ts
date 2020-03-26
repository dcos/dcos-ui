import { RequestUtil } from "mesosphere-shared-reactjs";

import Config from "#SRC/js/config/Config";
import getFixtureResponses from "#SRC/js/utils/getFixtureResponses";
import {
  REQUEST_NETWORKING_BACKEND_CONNECTIONS_ERROR,
  REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS,
  REQUEST_NETWORKING_BACKEND_CONNECTIONS_ONGOING,
  REQUEST_NETWORKING_NODE_MEMBERSHIPS_ERROR,
  REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
  REQUEST_NETWORKING_NODE_MEMBERSHIPS_ONGOING,
  REQUEST_NETWORKING_VIP_DETAIL_ERROR,
  REQUEST_NETWORKING_VIP_DETAIL_SUCCESS,
  REQUEST_NETWORKING_VIP_DETAIL_ONGOING,
  REQUEST_NETWORKING_VIP_SUMMARIES_ERROR,
  REQUEST_NETWORKING_VIP_SUMMARIES_SUCCESS,
  REQUEST_NETWORKING_VIP_SUMMARIES_ONGOING,
  REQUEST_NETWORKING_VIPS_ERROR,
  REQUEST_NETWORKING_VIPS_SUCCESS,
} from "../constants/ActionTypes";

import SDK from "PluginSDK";

const NetworkingActions = {
  fetchVIPs() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.networkingAPIPrefix}/vips`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIPS_SUCCESS,
          data: response.array,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIPS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
        });
      },
    });
  },

  fetchVIPDetail(protocol, vip, port) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.networkingAPIPrefix}/${vip}/${protocol}/${port}`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIP_DETAIL_SUCCESS,
          data: response,
          vip: `${protocol}:${vip}:${port}`,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIP_DETAIL_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          vip: `${protocol}:${vip}:${port}`,
        });
      },
      hangingRequestCallback() {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIP_DETAIL_ONGOING,
        });
      },
    });
  },

  fetchVIPBackendConnections(protocol, vip, port) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.networkingAPIPrefix}/backend-connections/${vip}/${protocol}/${port}`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS,
          data: response,
          vip: `${protocol}:${vip}:${port}`,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_BACKEND_CONNECTIONS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          vip: `${protocol}:${vip}:${port}`,
        });
      },
      hangingRequestCallback() {
        SDK.dispatch({
          type: REQUEST_NETWORKING_BACKEND_CONNECTIONS_ONGOING,
        });
      },
    });
  },

  fetchNodeMemberships() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.networkingAPIPrefix}/membership`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
          data: response.array,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_NODE_MEMBERSHIPS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
        });
      },
      hangingRequestCallback() {
        SDK.dispatch({
          type: REQUEST_NETWORKING_NODE_MEMBERSHIPS_ONGOING,
        });
      },
    });
  },

  fetchVIPSummaries() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.networkingAPIPrefix}/summary`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIP_SUMMARIES_SUCCESS,
          data: response.array,
        });
      },
      error(xhr) {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIP_SUMMARIES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
        });
      },
      hangingRequestCallback() {
        SDK.dispatch({
          type: REQUEST_NETWORKING_VIP_SUMMARIES_ONGOING,
        });
      },
    });
  },
};

if (Config.useFixtures) {
  const methodFixtureMapping = {
    fetchVIPs: import(
      /* vipsFixture */ "../../../../../tests/_fixtures/networking/networking-vips.json"
    ),
    fetchVIPDetail: import(
      /* vipDetailFixture */ "../../../../../tests/_fixtures/networking/networking-vip-detail.json"
    ),
    fetchVIPBackendConnections: import(
      /* backendConnectionsFixture */ "../../../../../tests/_fixtures/networking/networking-backend-connections.json"
    ),
    fetchNodeMemberships: import(
      /* nodeMembershipsFixture */ "../../../../../tests/_fixtures/networking/networking-node-memberships.json"
    ),
    fetchVIPSummaries: import(
      /* vipSummariesFixture */ "../../../../../tests/_fixtures/networking/networking-vip-summaries.json"
    ),
  };

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  if (!window.actionTypes.NetworkingActions) {
    window.actionTypes.NetworkingActions = {};
  }

  Promise.all(
    Object.keys(methodFixtureMapping).map(
      (method) => methodFixtureMapping[method]
    )
  ).then((responses) => {
    window.actionTypes.NetworkingActions = getFixtureResponses(
      methodFixtureMapping,
      responses
    );

    Object.keys(window.actionTypes.NetworkingActions).forEach((method) => {
      NetworkingActions[method] = RequestUtil.stubRequest(
        NetworkingActions,
        "NetworkingActions",
        method
      );
    });
  });
}

export default NetworkingActions;
