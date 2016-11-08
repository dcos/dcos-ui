const SystemLogUtil = {
  getUrl(nodeID, options, isStream = true) {
    let {params = {}} = options;

    let range = ['cursor', 'limit', 'skip_prev', 'skip_next'].reduce(function (memo, key) {
      if (options[key] === '' || options[key] == null) {
        return memo;
      }
      let rangeItem = `${key}=${encodeURIComponent(options[key])}`;
      if (memo !== '') {
        rangeItem = `&${rangeItem}`;
      }

      return memo + rangeItem;
    }, '');

    let paramString = Object.keys(params).reduce(function (memo, key) {
      if (params[key] === '' || params[key] == null) {
        return memo;
      }

      let paramItem = `filter=${encodeURIComponent(key)}:${encodeURIComponent(params[key])}`;
      if (memo !== '' || range !== '') {
        paramItem = `&${paramItem}`;
      }

      return memo + paramItem;
    }, '');

    let endpoint = 'logs';
    if (isStream) {
      endpoint = 'stream';
    }

    let timestamp = `timestamp=${Date.now()}`;
    if (range !== '' || paramString !== '') {
      timestamp = `&${timestamp}`;
    }

    return `system/logs/v1/agent/${nodeID}/${endpoint}?${range}${paramString}${timestamp}`;
  }
};

module.exports = SystemLogUtil;
