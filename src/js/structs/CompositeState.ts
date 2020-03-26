import NodesList from "./NodesList";
import Node from "./Node";
import Util from "../utils/Util";
import ServicesList from "../../../plugins/services/src/js/structs/ServicesList";

const MISSING_HEALTH_NODE = {
  health: 3,
};

// Mutates node data with node health data. This is much faster than mapping and creating new node objects
const enrichNodeDataWithHealthData = (nodes, healthData) => {
  nodes.forEach((node) => {
    const matchedHealthNode = healthData[node.hostname] || MISSING_HEALTH_NODE;

    node.health = matchedHealthNode.health;
  });
};

let storedNodeHealth, storedState;
class CompositeState {
  constructor(data = {}) {
    this._refCount = 0;
    this.data = data;
    this.masterInfo = null;
    this.nodeHealthData = {};
  }

  /**
   * Enables the composite state if there is no
   * one requesting it to be disabled anymore
   */
  enable() {
    this._refCount = Math.max(this._refCount - 1, 0);

    // if this update enables the composite state again, let's update everyting
    if (!this._isDisabled()) {
      if (storedNodeHealth) {
        this.addNodeHealth(storedNodeHealth);
        storedNodeHealth = null;
      }

      if (storedState) {
        this.addState(storedState);
        storedState = null;
      }
    }
  }

  /**
   * Disables the composite state
   */
  disable() {
    this._refCount = this._refCount + 1;
  }

  _isDisabled() {
    return this._refCount > 0;
  }

  addNodeHealth(data) {
    if (this._isDisabled()) {
      storedNodeHealth = data;

      return;
    }
    if (data == null) {
      return;
    }

    // Memoize node health data as an object with "host_ip" keys
    this.nodeHealthData = Util.keyBy(data, "host_ip");

    this.data.slaves = this.data.slaves || [];
    enrichNodeDataWithHealthData(this.data.slaves, this.nodeHealthData);
  }

  addMasterInfo(masterInfo) {
    this.masterInfo = masterInfo;
  }

  addState(newData) {
    if (this._isDisabled()) {
      storedState = newData;

      return;
    }
    if (newData == null) {
      return;
    }

    if (this.masterInfo) {
      newData.master_info = this.masterInfo;
    }
    this.data = newData;

    // Reuse memoized node health data
    this.data.slaves = this.data.slaves || [];
    enrichNodeDataWithHealthData(this.data.slaves, this.nodeHealthData);
  }

  getServiceList() {
    return new ServicesList({
      items: this.data.frameworks,
    });
  }

  set data(newData) {
    this._data = newData;
    this._nodesList = null;
  }

  get data() {
    return this._data;
  }

  getNodesList() {
    if (this._nodesList === null) {
      this._nodesList = new NodesList({ items: this.data.slaves });
    }

    return this._nodesList;
  }

  getMasterNode() {
    return new Node(this.data.master_info);
  }
}

export default new CompositeState({ frameworks: [], slaves: [] });
