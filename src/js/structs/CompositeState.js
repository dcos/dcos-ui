import NodesList from "./NodesList";
import ServicesList
  from "../../../plugins/services/src/js/structs/ServicesList";

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
    return Object.assign({}, oldDatum, newDatum);
  });
};

class CompositeState {
  constructor(data = {}) {
    this.data = data;
  }

  addMarathonApps(data) {
    if (Object.keys(this.data).length === 0) {
      return;
    }

    this.data.frameworks.forEach(function(service) {
      // Marathon data merged by service name because Marathon doesn't know id.
      // See MarathonStore.processMarathonGroups
      if (data[service.name]) {
        service._meta = Object.assign({}, service._meta, {
          marathon: data[service.name]
        });
      }
    });
  }

  addNodeHealth(data) {
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

      return Object.assign({}, oldDatum, matchedNode);
    });

    this.data.slaves = newData;
  }

  addState(data) {
    this.data = mergeData(data, this.data);
  }

  addSummary(data) {
    this.data = mergeData(data, this.data);
  }

  getServiceList() {
    return new ServicesList({
      items: this.data.frameworks
    });
  }

  getNodesList() {
    return new NodesList({ items: this.data.slaves });
  }
}

module.exports = new CompositeState({ frameworks: [], slaves: [] });
