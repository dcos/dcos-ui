var Config = require('../config/Config');

var Cluster = {
  /*
   * @param name of the service
   */
  getServiceLink: function (name) {
    return Config.rootUrl + '/service/' + encodeURIComponent(name) + '/';
  }

};

module.exports = Cluster;
