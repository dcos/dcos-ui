var _ = require('underscore');

var Config = require('../config/Config');
var Maths = require('../utils/Maths');

const MesosSummaryUtil = {

  sumResources: function (resourceList) {
    return _.foldl(resourceList, function (memo, resource) {
      if (resource == null) {
        return memo;
      }

      _.each(memo, function (value, key) {
        memo[key] = value + resource[key];
      });

      return memo;
    }, {cpus: 0, mem: 0, disk: 0});
  },

  stateResourcesToResourceStates: function (stateResources) {
    // Transpose from [{date, resources, totalResources}, ...]
    // to {resource: [{date, value, percentage}, ...], resource: ...}
    let resources = {cpus: [], mem: [], disk: []};
    let resourceTypes = Object.keys(resources);

    stateResources.forEach(function (stateResource) {
      resourceTypes.forEach(function (resourceType) {
        let percentage = null, value = null;

        if (stateResource.resources != null) {
          let max = Math.max(1, stateResource.totalResources[resourceType]);
          value = stateResource.resources[resourceType];
          percentage = Maths.round(100 * value / max);
        }

        resources[resourceType].push({
          date: stateResource.date,
          percentage,
          value
        });
      });
    });

    return resources;
  },

  filterHostsByService: function (hosts, frameworkId) {
    return _.filter(hosts, function (host) {
      return _.contains(host.framework_ids, frameworkId);
    });
  },

  getInitialStates: function () {
    var currentDate = Date.now();
    // reverse date range!!!
    return _.map(_.range(-Config.historyLength, 0), function (i) {
      return {
        date: currentDate + (i * Config.getRefreshRate()),
        frameworks: [],
        slaves: [],
        used_resources: {cpus: 0, mem: 0, disk: 0},
        total_resources: {cpus: 0, mem: 0, disk: 0}
      };
    });
  },

  addTimestampsToData: function (data, timeStep) {
    var length = data.length;
    var timeNow = Date.now() - timeStep;

    return _.map(data, function (datum, i) {
      var timeDelta = (-length + i) * timeStep;
      datum.date = timeNow + timeDelta;
      return datum;
    });
  }

};

module.exports = MesosSummaryUtil;
