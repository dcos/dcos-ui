import Config from '../config/Config';

const SystemLogUtil = {
  /**
   * Creates a URL to use with the events stream for logs
   * given the paramters provided
   * @param {String} nodeID ID of the node to retrieve logs from
   * @param {Object} [options] Optional parameters for request
   * @param {String} [options.cursor] ID of the cursor to request entries from
   * @param {String} [options.subscriptionID] ID to emit events to,
   *   if omitted a new one will be created
   * @param {Number} [options.skip_prev] how many entries backwards to look
   * @param {Number} [options.skip_next] how many entroes to look ahead
   * @param {Number} [options.limit] limit how many entries to receive
   * @param {Object} [options.filter] filter parameters to add to URL
   * @param {String} [options.frameworkID] ID for framework to retrieve logs from
   * @param {String} [options.executorID] ID for executor to retrieve logs from
   * @param {String} [options.containerID] ID for container to retrieve logs from
   * @param {Boolean} [isStream = true] whether to use stream or range endpoint
   * @returns {String} URL for system logs request
   */
  getUrl(nodeID, options, isStream = true) {
    let {filter = {}} = options;

    let range = ['cursor', 'limit', 'skip_prev', 'skip_next'].reduce(function (memo, key) {
      if (options[key] !== '' && options[key] != null) {
        memo.push(`${key}=${encodeURIComponent(options[key])}`);
      }

      return memo;
    }, []);

    let paramsArray = Object.keys(filter).reduce(function (memo, key) {
      if (filter[key] !== '' && filter[key] != null) {
        memo.push(
          `filter=${encodeURIComponent(key)}:${encodeURIComponent(filter[key])}`
        );
      }

      return memo;
    }, range);

    let endpoint = 'range';
    if (isStream) {
      endpoint = 'stream';
    }

    let idArray = ['framework', 'executor', 'container'].reduce(function (memo, key) {
      let id = `${key}ID`;
      if (options[id] !== '' && options[id] != null) {
        memo.push(id, options[id]);
      }

      return memo;
    }, []);

    return `${Config.logsAPIPrefix}/${nodeID}/logs/v1/${endpoint}/${idArray.join('/')}?${paramsArray.join('&')}`;
  }
};

module.exports = SystemLogUtil;
