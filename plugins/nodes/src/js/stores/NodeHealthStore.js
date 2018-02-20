import PluginSDK from "PluginSDK";

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
} from "#SRC/js/constants/ActionTypes";
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
} from "#SRC/js/constants/EventTypes";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import CompositeState from "#SRC/js/structs/CompositeState";
import Config from "#SRC/js/config/Config";
import GetSetBaseStore from "#SRC/js/stores/GetSetBaseStore";
import HealthUnit from "#SRC/js/structs/HealthUnit";
import HealthUnitsList from "#SRC/js/structs/HealthUnitsList";
import Node from "#SRC/js/structs/Node";
import NodeHealthActions from "#SRC/js/events/NodeHealthActions";
import NodesList from "#SRC/js/structs/NodesList";
import VisibilityStore from "#SRC/js/stores/VisibilityStore";

let requestInterval = null;

function startPolling() {
  if (requestInterval == null) {
    NodeHealthActions.fetchNodes();
    requestInterval = setInterval(
      NodeHealthActions.fetchNodes,
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

class NodeHealthStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      nodes: [],
      nodesByID: {},
      unitsByNodeID: {},
      unitsByID: {}
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: HEALTH_NODES_CHANGE,
        error: HEALTH_NODES_ERROR,
        nodeSuccess: HEALTH_NODE_SUCCESS,
        nodeError: HEALTH_NODE_ERROR,
        unitsSuccess: HEALTH_NODE_UNITS_SUCCESS,
        unitsError: HEALTH_NODE_UNITS_ERROR,
        unitSuccess: HEALTH_NODE_UNIT_SUCCESS,
        unitError: HEALTH_NODE_UNIT_ERROR
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      const action = payload.action;
      const data = action.data;

      switch (action.type) {
        case REQUEST_HEALTH_NODES_SUCCESS:
          //injects health data for a fake node
          this.processNodes(
            data.concat({
              host_ip: "11.0.0.1",
              health: 0,
              role: "agent_public"
            })
          );
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
      items: this.get("nodes")
    });
  }

  getNode(id) {
    return new Node(this.get("nodesByID")[id] || {});
  }

  getUnits(nodeID) {
    const units = this.get("unitsByNodeID")[nodeID] || [];

    return new HealthUnitsList({ items: units });
  }

  getUnit(unitID) {
    return new HealthUnit(this.get("unitsByID")[unitID] || []);
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
    this.set({ nodes });

    CompositeState.addNodeHealth(nodes);

    this.emit(HEALTH_NODES_CHANGE);
  }

  processNode(nodeData, nodeID) {
    const nodesByID = this.get("nodesByID");
    nodesByID[nodeID] = nodeData;

    this.set({ nodesByID });

    this.emit(HEALTH_NODE_SUCCESS, nodeID);
  }

  processUnits(units, nodeID) {
    const unitsByNodeID = this.get("unitsByNodeID");
    unitsByNodeID[nodeID] = units;

    this.set({ unitsByNodeID });

    this.emit(HEALTH_NODE_UNITS_SUCCESS, nodeID);
  }

  processUnit(unitData, nodeID, unitID) {
    const unitsByID = this.get("unitsByID");
    unitsByID[unitID] = unitData;

    this.set({ unitsByID });

    this.emit(HEALTH_NODE_UNIT_SUCCESS, nodeID, unitID);
  }

  get storeID() {
    return "nodeHealth";
  }
}

module.exports = new NodeHealthStore();
