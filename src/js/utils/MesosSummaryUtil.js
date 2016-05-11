var Config = require('../config/Config');
var Maths = require('../utils/Maths');

const MesosSummaryUtil = {

  sumResources: function (resourceList) {
    return resourceList.reduce(function (memo, resource) {
      if (resource == null) {
        return memo;
      }

      Object.keys(memo).forEach(function (key) {
        memo[key] = memo[key] + resource[key];
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
    return hosts.filter(function (host) {
      return host.framework_ids.includes(frameworkId);
    });
  },

  getInitialStates: function () {
    var currentDate = Date.now();
    // reverse date range!!!
    let reverseRange = [];
    for (let i = Config.historyLength; i > 0; i--) {
      reverseRange.push(-i);
    }
    return reverseRange.map(function (i) {
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

    return data.map(function (datum, i) {
      var timeDelta = (-length + i) * timeStep;
      datum.date = timeNow + timeDelta;
      return datum;
    });
  }

};

module.exports = MesosSummaryUtil;
