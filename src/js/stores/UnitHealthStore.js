import PluginSDK from "PluginSDK";

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
} from "../constants/ActionTypes";
import {
  HEALTH_UNIT_SUCCESS,
  HEALTH_UNIT_ERROR,
  HEALTH_UNIT_NODES_SUCCESS,
  HEALTH_UNIT_NODES_ERROR,
  HEALTH_UNIT_NODE_SUCCESS,
  HEALTH_UNIT_NODE_ERROR,
  HEALTH_UNITS_ERROR,
  HEALTH_UNITS_CHANGE
} from "../constants/EventTypes";
import AppDispatcher from "../events/AppDispatcher";
import Config from "../config/Config";
import GetSetBaseStore from "./GetSetBaseStore";
import HealthUnit from "../structs/HealthUnit";
import HealthUnitsList from "../structs/HealthUnitsList";
import Node from "../structs/Node";
import NodesList from "../structs/NodesList";
import UnitHealthActions from "../events/UnitHealthActions";

let requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    UnitHealthActions.fetchUnits();
    requestInterval = setInterval(
      UnitHealthActions.fetchUnits,
      Config.getRefreshRate()
    );
  }
}

function stopPolling() {
  if (requestInterval != null) {
    clearInterval(requestInterval);
    requestInterval = null;
  }
}

class UnitHealthStore extends GetSetBaseStore {
  constructor(...args) {
    super(...args);

    this.getSet_data = {
      units: [],
      unitsByID: {},
      nodesByUnitID: {},
      nodesByID: {}
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: HEALTH_UNITS_CHANGE,
        error: HEALTH_UNITS_ERROR,
        unitSuccess: HEALTH_UNIT_SUCCESS,
        unitError: HEALTH_UNIT_ERROR,
        nodesSuccess: HEALTH_UNIT_NODES_SUCCESS,
        nodesError: HEALTH_UNIT_NODES_ERROR,
        nodeSuccess: HEALTH_UNIT_NODE_SUCCESS,
        nodeError: HEALTH_UNIT_NODE_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      const action = payload.action;
      const data = action.data;

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

  shouldPoll() {
    return !(this.listeners(HEALTH_UNITS_CHANGE).length === 0);
  }

  getUnits() {
    return new HealthUnitsList({
      items: this.get("units")
    });
  }

  getUnit(id) {
    return new HealthUnit(this.get("unitsByID")[id] || {});
  }

  getNodes(unitID) {
    const nodes = this.get("nodesByUnitID")[unitID] || [];

    return new NodesList({ items: nodes });
  }

  getNode(nodeID) {
    return new Node(this.get("nodesByID")[nodeID] || {});
  }

  getDownloadURL() {
    return `${Config.rootUrl}${Config.unitHealthAPIPrefix}/report/download`;
  }

  fetchUnits(...args) {
    return UnitHealthActions.fetchUnits(...args);
  }

  fetchUnit(...args) {
    return UnitHealthActions.fetchUnit(...args);
  }

  fetchUnitNodes(...args) {
    return UnitHealthActions.fetchUnitNodes(...args);
  }

  fetchUnitNode(...args) {
    return UnitHealthActions.fetchUnitNode(...args);
  }

  processUnits(units) {
    this.set({ units });

    this.emit(HEALTH_UNITS_CHANGE);
  }

  processUnit(unitData, unitID) {
    const unitsByID = this.get("unitsByID");
    unitsByID[unitID] = unitData;

    this.set({ unitsByID });

    this.emit(HEALTH_UNIT_SUCCESS, unitID);
  }

  processNodes(nodes, unitID) {
    const nodesByUnitID = this.get("nodesByUnitID");
    nodesByUnitID[unitID] = nodes;

    this.set({ nodesByUnitID });

    this.emit(HEALTH_UNIT_NODES_SUCCESS, unitID);
  }

  processNode(nodeData, unitID, nodeID) {
    const nodesByID = this.get("nodesByID");
    nodesByID[nodeID] = nodeData;

    this.set({ nodesByID });

    this.emit(HEALTH_UNIT_NODE_SUCCESS, unitID, nodeID);
  }

  get storeID() {
    return "unitHealth";
  }
}

export default new UnitHealthStore();
