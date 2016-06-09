import BaseStore from './BaseStore';
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

class UnitHealthStore extends BaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      units: [],
      unitsByID: {},
      nodesByUnitID: {},
      nodesByID: {}
    };

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      let action = payload.action;
      let data = action.data;

      switch (action.type) {
        case REQUEST_HEALTH_UNITS_SUCCESS:
          this.processUnits(data);
          break;
        case REQUEST_HEALTH_UNITS_ERROR:
          this.emit(HEALTH_UNITS_ERROR, data);
          break;
        case REQUEST_HEALTH_UNIT_SUCCESS:
          this.processUnit(data, action.unitID);
          break;
        case REQUEST_HEALTH_UNIT_ERROR:
          this.emit(HEALTH_UNIT_ERROR, data, action.unitID);
          break;
        case REQUEST_HEALTH_UNIT_NODES_SUCCESS:
          this.processNodes(data, action.unitID);
          break;
        case REQUEST_HEALTH_UNIT_NODES_ERROR:
          this.emit(HEALTH_UNIT_NODES_ERROR, data, action.unitID);
          break;
        case REQUEST_HEALTH_UNIT_NODE_SUCCESS:
          this.processNode(data, action.unitID, action.nodeID);
          break;
        case REQUEST_HEALTH_UNIT_NODE_ERROR:
          this.emit(HEALTH_UNIT_NODE_ERROR, data, action.unitID, action.nodeID);
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
    return !(this.listeners(HEALTH_UNITS_CHANGE).length === 0);
  }

  getUnits() {
    return new HealthUnitsList({
      items: this.get('units')
    });
  }

  getUnit(id) {
    return new HealthUnit(this.get('unitsByID')[id] || {});
  }

  getNodes(unitID) {
    let nodes = this.get('nodesByUnitID')[unitID] || [];
    return new NodesList({items: nodes});
  }

  getNode(nodeID) {
    return new Node(this.get('nodesByID')[nodeID] || []);
  }

  getDownloadURL() {
    return `${Config.rootUrl}${Config.unitHealthAPIPrefix}\/report`;
  }

  fetchUnits() {
    return UnitHealthActions.fetchUnits(...arguments);
  }

  fetchUnit() {
    return UnitHealthActions.fetchUnit(...arguments);
  }

  fetchUnitNodes() {
    return UnitHealthActions.fetchUnitNodes(...arguments);
  }

  fetchUnitNode() {
    return UnitHealthActions.fetchUnitNode(...arguments);
  }

  processUnits(units) {
    this.set({units});

    this.emit(HEALTH_UNITS_CHANGE);
  }

  processUnit(unitData, unitID) {
    let unitsByID = this.get('unitsByID');
    unitsByID[unitID] = unitData;

    this.set({unitsByID});

    this.emit(HEALTH_UNIT_SUCCESS, unitID);
  }

  processNodes(nodes, unitID) {
    let nodesByUnitID = this.get('nodesByUnitID');
    nodesByUnitID[unitID] = nodes;

    this.set({nodesByUnitID});

    this.emit(HEALTH_UNIT_NODES_SUCCESS, unitID);
  }

  processNode(nodeData, unitID, nodeID) {
    let nodesByID = this.get('nodesByID');
    nodesByID[nodeID] = nodeData;

    this.set({nodesByID});

    this.emit(HEALTH_UNIT_NODE_SUCCESS, unitID, nodeID);
  }

  get storeID() {
    return 'unitHealth';
  }

}

module.exports = new UnitHealthStore();
