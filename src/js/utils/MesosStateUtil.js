import Util from './Util';
const RESOURCE_KEYS = ['cpus', 'disk', 'mem'];

const MesosStateUtil = {

  /**
   * @param  {Object} state A document of mesos state
   * @param  {Array} filter Allows us to filter by framework id
   *   All other frameworks will be put into an 'other' category
   * @returns {Object} A map of frameworks running on host
   */
  getHostResourcesByFramework: function (state, filter = []) {
    return state.frameworks.reduce(function (memo, framework) {
      framework.tasks.forEach(function (task) {
        if (memo[task.slave_id] == null) {
          memo[task.slave_id] = {};
        }

        var frameworkKey = task.framework_id;
        if (filter.includes(framework.id)) {
          frameworkKey = 'other';
        }

        let resources = task.resources;
        if (memo[task.slave_id][frameworkKey] == null) {
          memo[task.slave_id][frameworkKey] = resources;
        } else {
          // Aggregates used resources from each executor
          RESOURCE_KEYS.forEach(function (key) {
            memo[task.slave_id][frameworkKey][key] += resources[key];
          });
        }
      });

      return memo;
    }, {});
  },

  getTasksFromVirtualNetworkName: function (state = {}, overlayName) {
    let frameworks = state.frameworks || [];
    return frameworks.reduce(function (memo, framework) {
      let tasks = framework.tasks || [];

      return memo.concat(tasks.filter(function (task) {
        return Util.findNestedPropertyInObject(
          task,
          'container.network_infos.0.name'
        ) === overlayName;
      }));
    }, []);
  }

};

module.exports = MesosStateUtil;
