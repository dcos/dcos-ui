import ActionTypes from '../constants/ActionTypes';
var AppDispatcher = require('./AppDispatcher');
var Config = require('../config/Config');
var RequestUtil = require('../utils/RequestUtil');

var MetadataActions = {

  fetch: function () {
    RequestUtil.json({
      url: Config.rootUrl + '/metadata',
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METADATA,
          data: response
        });
      }
    });

    RequestUtil.json({
      url: Config.rootUrl + '/dcos-metadata/dcos-version.json',
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_DCOS_METADATA,
          data: response
        });
      }
    });
  }

};

module.exports = MetadataActions;
