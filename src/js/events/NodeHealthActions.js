import { RequestUtil } from "mesosphere-shared-reactjs";

import {
  REQUEST_HEALTH_NODE_ERROR,
  REQUEST_HEALTH_NODE_SUCCESS,
  REQUEST_HEALTH_NODE_UNITS_ERROR,
  REQUEST_HEALTH_NODE_UNITS_SUCCESS,
  REQUEST_HEALTH_NODE_UNIT_ERROR,
  REQUEST_HEALTH_NODE_UNIT_SUCCESS,
  REQUEST_HEALTH_NODES_ERROR,
  REQUEST_HEALTH_NODES_SUCCESS
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import getFixtureResponses from "../utils/getFixtureResponses";

const NodeHealthActions = {
  fetchNodes() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODES_SUCCESS,
          data: response.nodes
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  fetchNode(nodeID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes/${nodeID}`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_SUCCESS,
          data: response,
          nodeID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          nodeID,
          xhr
        });
      }
    });
  },

  fetchNodeUnits(nodeID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes/${nodeID}/units`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNITS_SUCCESS,
          data: response.units,
          nodeID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNITS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          nodeID,
          xhr
        });
      }
    });
  },

  fetchNodeUnit(nodeID, unitID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes/${nodeID}/units/${unitID}`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNIT_SUCCESS,
          data: response,
          nodeID,
          unitID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNIT_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          nodeID,
          unitID,
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const methodFixtureMapping = {
    fetchNodes: import(
      /* nodesFixture */ "../../../tests/_fixtures/unit-health/nodes"
    ),
    fetchNode: import(
      /* nodeFixture */ "../../../tests/_fixtures/unit-health/node.json"
    ),
    fetchNodeUnits: import(
      /* nodeUnitsFixture */ "../../../tests/_fixtures/unit-health/node-units.json"
    ),
    fetchNodeUnit: import(
      /* nodeUnitFixture */ "../../../tests/_fixtures/unit-health/node-unit.json"
    )
  };

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  Promise.all(
    Object.keys(methodFixtureMapping).map(
      method => methodFixtureMapping[method]
    )
  ).then(responses => {
    global.actionTypes.NodeHealthActions = getFixtureResponses(
      methodFixtureMapping,
      responses
    );

    Object.keys(global.actionTypes.NodeHealthActions).forEach(method => {
      NodeHealthActions[method] = RequestUtil.stubRequest(
        NodeHealthActions,
        "NodeHealthActions",
        method
      );
    });
  });
}

module.exports = NodeHealthActions;
