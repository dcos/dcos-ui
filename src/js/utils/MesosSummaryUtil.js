import Config from "../config/Config";
import Maths from "../utils/Maths";

const MesosSummaryUtil = {
  sumResources(resourceList) {
    return resourceList.reduce(
      (memo, resource) => {
        if (resource == null) {
          return memo;
        }

        Object.keys(memo).forEach(key => {
          memo[key] = memo[key] + resource[key];
        });

        return memo;
      },
      { cpus: 0, mem: 0, disk: 0, gpus: 0 }
    );
  },

  stateResourcesToResourceStates(stateResources) {
    // Transpose from [{date, resources, totalResources}, ...]
    // to {resource: [{date, value, percentage}, ...], resource: ...}
    const resources = { cpus: [], mem: [], disk: [], gpus: [] };
    const resourceTypes = Object.keys(resources);

    stateResources
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .forEach(stateResource => {
        resourceTypes.forEach(resourceType => {
          let percentage = null,
            value = null;

          if (stateResource.resources != null) {
            const max = Math.max(1, stateResource.totalResources[resourceType]);
            value = stateResource.resources[resourceType];
            percentage = Maths.round((100 * value) / max);
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

  filterHostsByService(hosts, frameworkId) {
    return hosts.filter(({ framework_ids = [] }) => {
      return framework_ids.includes(frameworkId);
    });
  },

  getInitialStates() {
    var currentDate = Date.now();
    // reverse date range!!!
    const reverseRange = [];

    for (let i = Config.historyLength; i > 0; i--) {
      reverseRange.push(-i);
    }

    return reverseRange.map(i => {
      return Object.assign(MesosSummaryUtil.getEmptyState(), {
        date: currentDate + i * Config.getRefreshRate()
      });
    });
  },

  getEmptyState() {
    return {
      frameworks: [],
      slaves: [],
      used_resources: { cpus: 0, mem: 0, disk: 0, gpus: 0 },
      total_resources: { cpus: 0, mem: 0, disk: 0, gpus: 0 }
    };
  },

  addTimestampsToData(data, timeStep) {
    var length = data.length;
    var timeNow = Date.now() + timeStep;

    return data.map((datum, i) => {
      var timeDelta = (-length + i) * timeStep;
      datum.date = timeNow + timeDelta;

      return datum;
    });
  }
};

module.exports = MesosSummaryUtil;
