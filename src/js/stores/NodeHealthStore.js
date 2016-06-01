import GetSetBaseStore from './GetSetBaseStore';

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

class NodeHealthStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      nodes: [],
      nodesByID: {},
      unitsByNodeID: {},
      unitsByID: {}
    };

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      let action = payload.action;
      let data = action.data;

      switch (action.type) {
        case REQUEST_HEALTH_NODES_SUCCESS:
          this.processNodes(data);
          break;
        case REQUEST_HEALTH_NODES_ERROR:
          this.emit(HEALTH_NODES_ERROR, data);
          break;
        case REQUEST_HEALTH_NODE_SUCCESS:
          this.processNode(data, action.nodeID);
          break;
        case REQUEST_HEALTH_NODE_ERROR:
          this.emit(HEALTH_NODE_ERROR, data, action.nodeID);
          break;
        case REQUEST_HEALTH_NODE_UNITS_SUCCESS:
          this.processUnits(data, action.nodeID);
          break;
        case REQUEST_HEALTH_NODE_UNITS_ERROR:
          this.emit(HEALTH_NODE_UNITS_ERROR, data, action.nodeID);
          break;
        case REQUEST_HEALTH_NODE_UNIT_SUCCESS:
          this.processNode(data, action.nodeID, action.unitID);
          break;
        case REQUEST_HEALTH_NODE_UNIT_ERROR:
          this.emit(HEALTH_NODE_UNIT_ERROR, data, action.nodeID, action.unitID);
          break;
      }

      return true;
    });

    VisibilityStore.addChangeListener(
      VISIBILITY_CHANGE,
      this.onVisibilityStoreChange.bind(this)
    );
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
    if (this.shouldPoll()) {
      startPolling();
    }
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);

    if (!this.shouldPoll()) {
      stopPolling();
    }
  }

  onVisibilityStoreChange() {
    if (!VisibilityStore.isInactive() && this.shouldPoll()) {
      startPolling();
      return;
    }

    stopPolling();
  }

  shouldPoll() {
    return !(this.listeners(HEALTH_NODES_CHANGE).length === 0);
  }

  getNodes() {
    return new NodesList({
      items: this.get('nodes')
    });
  }

  getNode(id) {
    return new Node(this.get('nodesByID')[id] || {});
  }

  getUnits(nodeID) {
    let units = this.get('unitsByNodeID')[nodeID] || [];
    return new HealthUnitsList({items: units});
  }

  getUnit(unitID) {
    return new HealthUnit(this.get('unitsByID')[unitID] || []);
  }

  fetchNodes() {
    return NodeHealthActions.fetchNodes(...arguments);
  }

  fetchNode() {
    return NodeHealthActions.fetchNode(...arguments);
  }

  fetchNodeUnits() {
    return NodeHealthActions.fetchNodeUnits(...arguments);
  }

  fetchNodeUnit() {
    return NodeHealthActions.fetchNodeUnit(...arguments);
  }

  processNodes(nodes) {
    this.set({nodes});

    CompositeState.addNodeHealth(nodes);

    this.emit(HEALTH_NODES_CHANGE);
  }

  processNode(nodeData, nodeID) {
    let nodesByID = this.get('nodesByID');
    nodesByID[nodeID] = nodeData;

    this.set({nodesByID});

    this.emit(HEALTH_NODE_SUCCESS, nodeID);
  }

  processUnits(units, nodeID) {
    let unitsByNodeID = this.get('unitsByNodeID');
    unitsByNodeID[nodeID] = units;

    this.set({unitsByNodeID});

    this.emit(HEALTH_NODE_UNITS_SUCCESS, nodeID);
  }

  processUnit(unitData, nodeID, unitID) {
    let unitsByID = this.get('unitsByID');
    unitsByID[unitID] = unitData;

    this.set({unitsByID});

    this.emit(HEALTH_NODE_UNIT_SUCCESS, nodeID, unitID);
  }

  get storeID() {
    return 'nodeHealth';
  }

}

module.exports = new NodeHealthStore();
