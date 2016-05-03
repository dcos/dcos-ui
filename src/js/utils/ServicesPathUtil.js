const ServicesPathUtil = {
  getRelativePath(id, currentGroup) {
    if (!currentGroup.endsWith('/')) {
      currentGroup += '/';
    }
    if (id.startsWith(currentGroup)) {
      return id.substring(currentGroup.length);
    }
    return id;
  },
  getGroupFromAppId(id) {
    return id.split('/').slice(0, -1).join('/') + '/';
  },
  getAppName(id) {
    var tokens = id.split('/');
    return tokens[tokens.length - 1];
  }
};

module.exports = ServicesPathUtil;
