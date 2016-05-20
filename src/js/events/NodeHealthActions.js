import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_HEALTH_NODE_ERROR,
  REQUEST_HEALTH_NODE_SUCCESS,
  REQUEST_HEALTH_NODE_UNITS_ERROR,
  REQUEST_HEALTH_NODE_UNITS_SUCCESS,
  REQUEST_HEALTH_NODE_UNIT_ERROR,
  REQUEST_HEALTH_NODE_UNIT_SUCCESS,
  REQUEST_HEALTH_NODES_ERROR,
  REQUEST_HEALTH_NODES_SUCCESS
} from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';

const NodeHealthActions = {

  fetchNodes: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODES_SUCCESS,
          data: response.nodes
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  fetchNode: function (nodeID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes/${nodeID}`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_SUCCESS,
          data: response,
          nodeID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          nodeID
        });
      }
    });
  },

  fetchNodeUnits: function (nodeID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes/${nodeID}/units`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNITS_SUCCESS,
          data: response.units,
          nodeID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNITS_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          nodeID
        });
      }
    });
  },

  fetchNodeUnit: function (nodeID, unitID) {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.unitHealthAPIPrefix}/nodes/${nodeID}/units/${unitID}`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNIT_SUCCESS,
          data: response,
          nodeID,
          unitID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_HEALTH_NODE_UNIT_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          nodeID,
          unitID
        });
      }
    });
  }
};

if (Config.useFixtures) {
  let nodesFixture = require('../../../tests/_fixtures/unit-health/nodes.json');
  let nodeFixture = require('../../../tests/_fixtures/unit-health/node.json');
  let nodeUnitsFixture = require('../../../tests/_fixtures/unit-health/node-units.json');
  let nodeUnitFixture = require('../../../tests/_fixtures/unit-health/node-unit.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.NodeHealthActions = {
    fetchNodes: {
      event: 'success', success: {response: nodesFixture}
    },
    fetchNode: {event: 'success', success: {response: nodeFixture}},
    fetchNodeUnits: {
      event: 'success', success: {response: nodeUnitsFixture}
    },
    fetchNodeUnit: {
      event: 'success', success: {response: nodeUnitFixture}
    }
  };

  Object.keys(global.actionTypes.NodeHealthActions).forEach(function (method) {
    NodeHealthActions[method] = RequestUtil.stubRequest(
      NodeHealthActions, 'NodeHealthActions', method
    );
  });
}

module.exports = NodeHealthActions;
