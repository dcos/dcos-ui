import _ from 'underscore';

import NodesList from './NodesList';
import ServicesList from './ServicesList';

const BLANK_NODE = {
  health: 3
};

let mergeData = function (newData, data) {
  Object.keys(newData).forEach(function (key) {
    if (_.isArray(newData[key])) {
      data[key] = mergeMesosArrays(newData, data, key);
    } else if (_.isObject(newData[key]) && data[key]) {
      // We need to recurse over any nested objects.
      data[key] = mergeData(newData[key], data[key]);
    } else {
      // Any other type of value can be replaced.
      data[key] = newData[key];
    }
  });

  return data;
};

let mergeMesosArrays = function (newData, data, key) {
  if (key === 'frameworks' || key === 'slaves') {
    // We need to merge the objects within the frameworks and slaves arrays.
    return mergeObjectsById(newData[key], data[key]);
  } else {
    // We can replace any other array.
    return newData[key];
  }
};

let mergeObjectsById = function (newData, data) {
  // Merge the incoming data with the old data.
  return newData.map(function (newDatum) {
    let oldDatum = _.findWhere(data, {id: newDatum.id});

    // These objects don't need to be deeply merged.
    return _.extend({}, oldDatum, newDatum);
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

    this.data.frameworks.forEach(function (service) {
      // Marathon data merged by service name because Marathon doesn't know id.
      // See MarathonStore.processMarathonGroups
      if (data[service.name]) {
        service._meta = _.extend({}, service._meta, {
          marathon: data[service.name]
        });
      }
    });
  }

  addNodeHealth(data) {
    let oldData = this.data.slaves || [];
    let dataByIP = {};

    data.forEach(function (datum) {
      dataByIP[datum.host_ip] = datum;
    });

    let newData = oldData.map(function (oldDatum) {
      let matchedNode = dataByIP[oldDatum.hostname] || BLANK_NODE;

      return _.extend({}, oldDatum, matchedNode);
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
    return new NodesList({items: this.data.slaves});
  }
}

module.exports = new CompositeState();
