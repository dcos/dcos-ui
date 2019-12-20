import { RequestUtil } from "mesosphere-shared-reactjs";

import {
  REQUEST_HEALTH_UNITS_SUCCESS,
  REQUEST_HEALTH_UNITS_ERROR,
  REQUEST_HEALTH_UNIT_SUCCESS,
  REQUEST_HEALTH_UNIT_ERROR,
  REQUEST_HEALTH_UNIT_NODES_SUCCESS,
  REQUEST_HEALTH_UNIT_NODES_ERROR,
  REQUEST_HEALTH_UNIT_NODE_SUCCESS,
  REQUEST_HEALTH_UNIT_NODE_ERROR
} from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";
import getFixtureResponses from "../utils/getFixtureResponses";

const UnitHealthActions = {
  fetchUnits() {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNITS_SUCCESS,
          data: response.units
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNITS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          xhr
        });
      }
    });
  },

  fetchUnit(unitID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units/${unitID}`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_SUCCESS,
          data: response,
          unitID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          unitID,
          xhr
        });
      }
    });
  },

  fetchUnitNodes(unitID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units/${unitID}/nodes`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODES_SUCCESS,
          data: response.nodes,
          unitID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          unitID,
          xhr
        });
      }
    });
  },

  fetchUnitNode(unitID, nodeID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units/${unitID}/nodes/${nodeID}`,
      success(response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODE_SUCCESS,
          data: response,
          unitID,
          nodeID
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          unitID,
          nodeID,
          xhr
        });
      }
    });
  }
};

if (Config.useFixtures) {
  const methodFixtureMapping = {
    fetchUnits: import(
      /* unitsFixture */ "../../../tests/_fixtures/unit-health/units.json"
    ),
    fetchUnit: import(
      /* unitFixture */ "../../../tests/_fixtures/unit-health/unit.json"
    ),
    fetchUnitNodes: import(
      /* unitNodesFixture */ "../../../tests/_fixtures/unit-health/unit-nodes.json"
    ),
    fetchUnitNode: import(
      /* unitNodeFixture */ "../../../tests/_fixtures/unit-health/unit-node.json"
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
    global.actionTypes.UnitHealthActions = getFixtureResponses(
      methodFixtureMapping,
      responses
    );

    Object.keys(global.actionTypes.UnitHealthActions).forEach(method => {
      UnitHealthActions[method] = RequestUtil.stubRequest(
        UnitHealthActions,
        "UnitHealthActions",
        method
      );
    });
  });
}

export default UnitHealthActions;
