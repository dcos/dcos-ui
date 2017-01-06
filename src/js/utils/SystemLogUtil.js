import Config from '../config/Config';

const paramOptions = [
  'cursor',
  'limit',
  'postfix',
  'read_reverse',
  'skip_prev',
  'skip_next'
];

const SystemLogUtil = {
  /**
   * Creates a URL to use with the events stream for logs
   * given the parameters provided
   * @param {String} nodeID ID of the node to retrieve logs from
   * @param {Object} [options] Optional parameters for request
   * @param {String} [options.cursor] ID of the cursor to request entries from
   * @param {String} [options.subscriptionID] ID to emit events to,
   *   if omitted a new one will be created
   * @param {String} [options.containerID] ID for container to retrieve logs from
   * @param {String} [options.executorID] ID for executor to retrieve logs from
   * @param {String} [options.frameworkID] ID for framework to retrieve logs from
   * @param {Object} [options.filter] filter parameters to add to URL
   * @param {Number} [options.limit] limit how many entries to receive
   * @param {Number} [options.postfix] postifx to add to the download name
   * @param {String} [options.read_reverse] will read events in reverse order if set to true
   * @param {Number} [options.skip_prev] how many entries backwards to look
   * @param {Number} [options.skip_next] how many entries to look ahead
   * @param {Boolean} [isStream = true] whether to use stream or range base
   * @param {String} [endpoint = ''] add aditional endpoint to the url
   * @returns {String} URL for system logs request
   */
  getUrl(nodeID, options, isStream = true, endpoint = '') {
    const {filter = {}} = options;

    const range = paramOptions.reduce((memo, key) => {
      if (options[key] !== '' && options[key] != null) {
        memo.push(`${key}=${encodeURIComponent(options[key])}`);
      }

      return memo;
    }, []);

    const paramsArray = Object.keys(filter).reduce(function (memo, key) {
      if (filter[key] !== '' && filter[key] != null) {
        memo.push(
          `filter=${encodeURIComponent(key)}:${encodeURIComponent(filter[key])}`
        );
      }

      return memo;
    }, range);

    let base = 'range';
    if (isStream) {
      base = 'stream';
    }

    const idArray = ['framework', 'executor', 'container'].reduce(function (memo, key) {
      const id = `${key}ID`;
      if (options[id] !== '' && options[id] != null) {
        memo.push(key, options[id]);
      }

      return memo;
    }, []);

    return `${Config.logsAPIPrefix}/${nodeID}/logs/v1/${base}/${idArray.join('/')}${endpoint}?${paramsArray.join('&')}`;
  }
};

module.exports = SystemLogUtil;
