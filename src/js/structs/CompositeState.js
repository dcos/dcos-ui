import NodesList from "./NodesList";
import Node from "./Node";
import ServicesList from "../../../plugins/services/src/js/structs/ServicesList";

const BLANK_NODE = {
  health: 3
};

const mergeData = function(newData, data) {
  Object.keys(newData).forEach(function(key) {
    if (Array.isArray(newData[key])) {
      data[key] = mergeMesosArrays(newData, data, key);
    } else if (typeof newData[key] === "object" && data[key]) {
      // We need to recurse over any nested objects.
      data[key] = mergeData(newData[key], data[key]);
    } else {
      // Any other type of value can be replaced.
      data[key] = newData[key];
    }
  });

  return data;
};

const mergeMesosArrays = function(newData, data, key) {
  if (key === "frameworks" || key === "slaves") {
    // We need to merge the objects within the frameworks and slaves arrays.
    return mergeObjectsById(newData[key], data[key]);
  } else {
    // We can replace any other array.
    return newData[key];
  }
};

const mergeObjectsById = function(newData, data = []) {
  // Merge the incoming data with the old data.
  return newData.map(function(newDatum) {
    const oldDatum = data.find(function(datum) {
      return datum.id === newDatum.id;
    });

    // These objects don't need to be deeply merged.
    return { ...oldDatum, ...newDatum };
  });
};

class CompositeState {
  constructor(data = {}) {
    this._refCount = 0;
    this.data = data;
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

    const oldData = this.data.slaves || [];
    const dataByIP = {};

    data.forEach(function(datum) {
      dataByIP[datum.host_ip] = datum;
    });

    const newData = oldData.map(function(oldDatum) {
      const matchedNode = dataByIP[oldDatum.hostname] || BLANK_NODE;

      return { ...oldDatum, ...matchedNode };
    });

    this.data = {
      ...this.data,
      slaves: newData
    };
  }

  addState(data) {
    if (this._isDisabled()) {
      return;
    }
    this.data = mergeData(data, this.data);
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
