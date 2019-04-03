import NodesList from "./NodesList";
import Node from "./Node";
import Util from "../utils/Util";
import ServicesList from "../../../plugins/services/src/js/structs/ServicesList";

const PRESERVE_KEYS = ["master_info"];
const MISSING_HEALTH_NODE = {
  health: 3
};

// replaces node data with previous node data plus health data
const enrichNodeDataWithHealthData = (nodes, healthData) => {
  return nodes.map(function(node) {
    const matchedHealthNode = healthData[node.hostname] || MISSING_HEALTH_NODE;

    return { ...node, ...matchedHealthNode };
  });
};

class CompositeState {
  constructor(data = {}) {
    this._refCount = 0;
    this.data = data;
    this.nodeHealthData = {};
  }

  /**
   * Enables the composite state if there is no
   * one requesting it to be disabled anymore
   */
  enable() {
    this._refCount = Math.max(this._refCount - 1, 0);
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
      return;
    }
    if (data == null) {
      return;
    }
    
    // Memoize node health data as an object with "host_ip" keys
    this.nodeHealthData = Util.keyBy(data, "host_ip")

    this.data.slaves = enrichNodeDataWithHealthData(this.data.slaves || [], this.nodeHealthData)
  }

  addState(newData) {
    if (this._isDisabled()) {
      return;
    }
    if (newData == null) {
      return;
    }

    this.data = {
      ...Util.pluck(this.data, PRESERVE_KEYS),
      ...newData
    };

    // Reuse memoized node health data
    this.data.slaves = enrichNodeDataWithHealthData(this.data.slaves || [], this.nodeHealthData)
  }

  getServiceList() {
    return new ServicesList({
      items: this.data.frameworks
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

module.exports = new CompositeState({ frameworks: [], slaves: [] });
