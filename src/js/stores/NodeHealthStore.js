import {Store} from 'mesosphere-shared-reactjs';

import {
  SERVER_ACTION,
  REQUEST_HEALTH_NODE_ERROR,
  REQUEST_HEALTH_NODE_SUCCESS,
  REQUEST_HEALTH_NODE_UNITS_ERROR,
  REQUEST_HEALTH_NODE_UNITS_SUCCESS,
  REQUEST_HEALTH_NODE_UNIT_ERROR,
  REQUEST_HEALTH_NODE_UNIT_SUCCESS,
  REQUEST_HEALTH_NODES_ERROR,
  REQUEST_HEALTH_NODES_SUCCESS
} from '../constants/ActionTypes';
import {
  HEALTH_NODE_ERROR,
  HEALTH_NODE_SUCCESS,
  HEALTH_NODE_UNITS_ERROR,
  HEALTH_NODE_UNITS_SUCCESS,
  HEALTH_NODE_UNIT_ERROR,
  HEALTH_NODE_UNIT_SUCCESS,
  HEALTH_NODES_CHANGE,
  HEALTH_NODES_ERROR,
  VISIBILITY_CHANGE
} from '../constants/EventTypes';
import AppDispatcher from '../events/AppDispatcher';
import CompositeState from '../structs/CompositeState';
import Config from '../config/Config';
import NodeHealthActions from '../events/NodeHealthActions';
import HealthUnit from '../structs/HealthUnit';
import HealthUnitsList from '../structs/HealthUnitsList';
import GetSetMixin from '../mixins/GetSetMixin';
import Node from '../structs/Node';
import NodesList from '../structs/NodesList';
import VisibilityStore from './VisibilityStore';

let requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    NodeHealthActions.fetchNodes();
    requestInterval = setInterval(
      NodeHealthActions.fetchNodes, Config.getRefreshRate()
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

  if (!isInactive && NodeHealthStore.shouldPoll()) {
    startPolling();
  }
}

VisibilityStore.addChangeListener(VISIBILITY_CHANGE, handleInactiveChange);

const NodeHealthStore = Store.createStore({

  storeID: 'nodeHealth',

  mixins: [GetSetMixin],

  getSet_data: {
    nodes: [],
    nodesByID: {},
    unitsByNodeID: {},
    unitsByID: {}
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
    return (this.listeners(HEALTH_NODES_CHANGE).length === 0);
  },

  getNodes: function () {
    return new NodesList({
      items: this.get('nodes')
    });
  },

  getNode: function (id) {
    return new Node(this.get('nodesByID')[id] || {});
  },

  getUnits: function (nodeID) {
    let units = this.get('unitsByNodeID')[nodeID] || [];
    return new HealthUnitsList({items: units});
  },

  getUnit: function (unitID) {
    return new HealthUnit(this.get('unitsByID')[unitID] || []);
  },

  fetchNodes: NodeHealthActions.fetchNodes,

  fetchNode: NodeHealthActions.fetchNode,

  fetchNodeUnits: NodeHealthActions.fetchNodeUnits,

  fetchNodeUnit: NodeHealthActions.fetchNodeUnit,

  processNodes: function (nodes) {
    this.set({nodes});

    CompositeState.addNodeHealth(nodes);

    this.emit(HEALTH_NODES_CHANGE);
  },

  processNode: function (nodeData, nodeID) {
    let nodesByID = this.get('nodesByID');
    nodesByID[nodeID] = nodeData;

    this.set({nodesByID});

    this.emit(HEALTH_NODE_SUCCESS, nodeID);
  },

  processUnits: function (units, nodeID) {
    let unitsByNodeID = this.get('unitsByNodeID');
    unitsByNodeID[nodeID] = units;

    this.set({unitsByNodeID});

    this.emit(HEALTH_NODE_UNITS_SUCCESS, nodeID);
  },

  processUnit: function (unitData, nodeID, unitID) {
    let unitsByID = this.get('unitsByID');
    unitsByID[unitID] = unitData;

    this.set({unitsByID});

    this.emit(HEALTH_NODE_UNIT_SUCCESS, nodeID, unitID);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    if (payload.source !== SERVER_ACTION) {
      return false;
    }

    let action = payload.action;
    let data = action.data;

    switch (action.type) {
      case REQUEST_HEALTH_NODES_SUCCESS:
        NodeHealthStore.processNodes(data);
        break;
      case REQUEST_HEALTH_NODES_ERROR:
        NodeHealthStore.emit(HEALTH_NODES_ERROR, data);
        break;
      case REQUEST_HEALTH_NODE_SUCCESS:
        NodeHealthStore.processNode(data, action.nodeID);
        break;
      case REQUEST_HEALTH_NODE_ERROR:
        NodeHealthStore.emit(HEALTH_NODE_ERROR, data, action.nodeID);
        break;
      case REQUEST_HEALTH_NODE_UNITS_SUCCESS:
        NodeHealthStore.processUnits(data, action.nodeID);
        break;
      case REQUEST_HEALTH_NODE_UNITS_ERROR:
        NodeHealthStore.emit(HEALTH_NODE_UNITS_ERROR, data, action.nodeID);
        break;
      case REQUEST_HEALTH_NODE_UNIT_SUCCESS:
        NodeHealthStore.processNode(data, action.nodeID, action.unitID);
        break;
      case REQUEST_HEALTH_NODE_UNIT_ERROR:
        NodeHealthStore.emit(HEALTH_NODE_UNIT_ERROR, data, action.nodeID, action.unitID);
        break;
    }

    return true;
  })

});

module.exports = NodeHealthStore;
