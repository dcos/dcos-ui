import {Store} from 'mesosphere-shared-reactjs';

import {
  SERVER_ACTION,
  REQUEST_HEALTH_UNITS_SUCCESS,
  REQUEST_HEALTH_UNITS_ERROR,
  REQUEST_HEALTH_UNIT_SUCCESS,
  REQUEST_HEALTH_UNIT_ERROR,
  REQUEST_HEALTH_UNIT_NODES_SUCCESS,
  REQUEST_HEALTH_UNIT_NODES_ERROR,
  REQUEST_HEALTH_UNIT_NODE_SUCCESS,
  REQUEST_HEALTH_UNIT_NODE_ERROR
} from '../constants/ActionTypes';
import {
  HEALTH_UNIT_SUCCESS,
  HEALTH_UNIT_ERROR,
  HEALTH_UNIT_NODES_SUCCESS,
  HEALTH_UNIT_NODES_ERROR,
  HEALTH_UNIT_NODE_SUCCESS,
  HEALTH_UNIT_NODE_ERROR,
  HEALTH_UNITS_ERROR,
  HEALTH_UNITS_CHANGE,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
import AppDispatcher from '../events/AppDispatcher';
import Config from '../config/Config';
import UnitHealthActions from '../events/UnitHealthActions';
import HealthUnit from '../structs/HealthUnit';
import HealthUnitsList from '../structs/HealthUnitsList';
import GetSetMixin from '../mixins/GetSetMixin';
import Node from '../structs/Node';
import NodesList from '../structs/NodesList';
import VisibilityStore from './VisibilityStore';

let requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    UnitHealthActions.fetchUnits();
    requestInterval = setInterval(
      UnitHealthActions.fetchUnits, Config.getRefreshRate()
    );
  }
}

function stopPolling() {
  if (requestInterval != null) {
    clearInterval(requestInterval);
    requestInterval = null;
  }
}

function handleInactiveChange() {
  let isInactive = VisibilityStore.get('isInactive');
  if (isInactive) {
    stopPolling();
  }

  if (!isInactive && UnitHealthStore.shouldPoll()) {
    startPolling();
  }
}

VisibilityStore.addChangeListener(VISIBILITY_CHANGE, handleInactiveChange);

const UnitHealthStore = Store.createStore({

  storeID: 'unitHealth',

  mixins: [GetSetMixin],

  getSet_data: {
    units: [],
    unitsByID: {},
    nodesByUnitID: {},
    nodesByID: {}
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);

    if (this.shouldPoll()) {
      startPolling();
    }
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  },

  shouldPoll: function () {
    return (this.listeners(HEALTH_UNITS_CHANGE).length === 0);
  },

  getUnits: function () {
    return new HealthUnitsList({
      items: this.get('units')
    });
  },

  getUnit: function (id) {
    return new HealthUnit(this.get('unitsByID')[id] || {});
  },

  getNodes: function (unitID) {
    let nodes = this.get('nodesByUnitID')[unitID] || [];
    return new NodesList({items: nodes});
  },

  getNode: function (nodeID) {
    return new Node(this.get('nodesByID')[nodeID] || []);
  },

  getDownloadURL: function () {
    return `${Config.rootUrl}${Config.unitHealthAPIPrefix}\/report`;
  },

  fetchUnits: UnitHealthActions.fetchUnits,

  fetchUnit: UnitHealthActions.fetchUnit,

  fetchUnitNodes: UnitHealthActions.fetchUnitNodes,

  fetchUnitNode: UnitHealthActions.fetchUnitNode,

  processUnits: function (units) {
    this.set({units});

    this.emit(HEALTH_UNITS_CHANGE);
  },

  processUnit: function (unitData, unitID) {
    let unitsByID = this.get('unitsByID');
    unitsByID[unitID] = unitData;

    this.set({unitsByID});

    this.emit(HEALTH_UNIT_SUCCESS, unitID);
  },

  processNodes: function (nodes, unitID) {
    let nodesByUnitID = this.get('nodesByUnitID');
    nodesByUnitID[unitID] = nodes;

    this.set({nodesByUnitID});

    this.emit(HEALTH_UNIT_NODES_SUCCESS, unitID);
  },

  processNode: function (nodeData, unitID, nodeID) {
    let nodesByID = this.get('nodesByID');
    nodesByID[nodeID] = nodeData;

    this.set({nodesByID});

    this.emit(HEALTH_UNIT_NODE_SUCCESS, unitID, nodeID);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== SERVER_ACTION) {
      return false;
    }

    let action = payload.action;
    let data = action.data;

    switch (action.type) {
      case REQUEST_HEALTH_UNITS_SUCCESS:
        UnitHealthStore.processUnits(data);
        break;
      case REQUEST_HEALTH_UNITS_ERROR:
        UnitHealthStore.emit(HEALTH_UNITS_ERROR, data);
        break;
      case REQUEST_HEALTH_UNIT_SUCCESS:
        UnitHealthStore.processUnit(data, action.unitID);
        break;
      case REQUEST_HEALTH_UNIT_ERROR:
        UnitHealthStore.emit(HEALTH_UNIT_ERROR, data, action.unitID);
        break;
      case REQUEST_HEALTH_UNIT_NODES_SUCCESS:
        UnitHealthStore.processNodes(data, action.unitID);
        break;
      case REQUEST_HEALTH_UNIT_NODES_ERROR:
        UnitHealthStore.emit(HEALTH_UNIT_NODES_ERROR, data, action.unitID);
        break;
      case REQUEST_HEALTH_UNIT_NODE_SUCCESS:
        UnitHealthStore.processNode(data, action.unitID, action.nodeID);
        break;
      case REQUEST_HEALTH_UNIT_NODE_ERROR:
        UnitHealthStore.emit(HEALTH_UNIT_NODE_ERROR, data, action.unitID, action.nodeID);
        break;
    }

    return true;
  })

});

module.exports = UnitHealthStore;
