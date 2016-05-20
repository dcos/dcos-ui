import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_HEALTH_UNITS_SUCCESS,
  REQUEST_HEALTH_UNITS_ERROR,
  REQUEST_HEALTH_UNIT_SUCCESS,
  REQUEST_HEALTH_UNIT_ERROR,
  REQUEST_HEALTH_UNIT_NODES_SUCCESS,
  REQUEST_HEALTH_UNIT_NODES_ERROR,
  REQUEST_HEALTH_UNIT_NODE_SUCCESS,
  REQUEST_HEALTH_UNIT_NODE_ERROR
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';

const UnitHealthActions = {

  fetchUnits: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNITS_SUCCESS,
          data: response.units
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNITS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchUnit: function (unitID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units/${unitID}`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_SUCCESS,
          data: response,
          unitID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          unitID
        });
      }
    });
  },

  fetchUnitNodes: function (unitID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units/${unitID}/nodes`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODES_SUCCESS,
          data: response.nodes,
          unitID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          unitID
        });
      }
    });
  },

  fetchUnitNode: function (unitID, nodeID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/units/${unitID}/nodes/${nodeID}`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODE_SUCCESS,
          data: response,
          unitID,
          nodeID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_UNIT_NODE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          unitID,
          nodeID
        });
      }
    });
  }
};

if (Config.useFixtures) {
  let unitsFixture = require('../../../tests/_fixtures/unit-health/units.json');
  let unitFixture = require('../../../tests/_fixtures/unit-health/unit.json');
  let unitNodesFixture = require('../../../tests/_fixtures/unit-health/unit-nodes.json');
  let unitNodeFixture = require('../../../tests/_fixtures/unit-health/unit-node.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.UnitHealthActions = {
    fetchUnits: {
      event: 'success', success: {response: unitsFixture}
    },
    fetchUnit: {event: 'success', success: {response: unitFixture}},
    fetchUnitNodes: {
      event: 'success', success: {response: unitNodesFixture}
    },
    fetchUnitNode: {
      event: 'success', success: {response: unitNodeFixture}
    }
  };

  Object.keys(global.actionTypes.UnitHealthActions).forEach(function (method) {
    UnitHealthActions[method] = RequestUtil.stubRequest(
      UnitHealthActions, 'UnitHealthActions', method
    );
  });
}

module.exports = UnitHealthActions;
