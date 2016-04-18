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

  // Caluculate a failure rate
  getFailureRate: function (state, prevState) {
    var prevMesosStatusesMap = prevState.getServiceList().sumTaskStates();
    var newMesosStatusesMap = state.getServiceList().sumTaskStates();
    var failed = 0;
    var successful = 0;
    var diff = {};
    let rate = null;

    // Only compute diff if we have previous data
    var keys = Object.keys(newMesosStatusesMap);
    // Ignore the first difference, since the first number of accumulated failed
    // tasks will be will consist the base case for calulating the difference
    if (prevMesosStatusesMap != null && keys.length) {
      keys.forEach(function (key) {
        diff[key] = newMesosStatusesMap[key] - prevMesosStatusesMap[key];
      });

      // refs: https://github.com/apache/mesos/blob/master/include/mesos/mesos.proto
      successful = (diff.TASK_STARTING || 0) +
        (diff.TASK_RUNNING || 0) +
        (diff.TASK_FINISHED || 0);
      failed = (diff.TASK_FAILED || 0) +
        (diff.TASK_LOST || 0) +
        (diff.TASK_ERROR || 0);
    }

    if (state.isSnapshotSuccessful()) {
      rate = (failed / (failed + successful)) * 100 | 0;
    }

    return {
      date: state.getSnapshotDate(),
      rate
    };
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

  getInitialTaskFailureRates: function () {
    var currentDate = Date.now();
    return _.map(_.range(-Config.historyLength, 0), function (i) {
      return {
        date: currentDate + (i * Config.getRefreshRate()),
        rate: 0
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
