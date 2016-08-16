import {RequestUtil} from 'mesosphere-shared-reactjs';

import {
  REQUEST_SIDEBAR_OPEN,
  REQUEST_SIDEBAR_CLOSE,
  REQUEST_CLI_INSTRUCTIONS,
  REQUEST_VERSIONS_SUCCESS,
  REQUEST_VERSIONS_ERROR,
  REQUEST_SIDEBAR_WIDTH_CHANGE
} from '../constants/ActionTypes';
import Config from '../config/Config';

import AppDispatcher from './AppDispatcher';

module.exports = {

  open() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_OPEN,
      data: true
    });
  },

  close() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_CLOSE,
      data: false
    });
  },

  openCliInstructions() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_CLI_INSTRUCTIONS,
      data: false
    });
  },

  showVersions() {
    var host = Config.rootUrl.replace(/:[0-9]{0,4}$/, '');
    var url = host + '/pkgpanda/active.buildinfo.full.json';

    RequestUtil.json({
      url,
      success(response) {
        AppDispatcher.handleSidebarAction({
          type: REQUEST_VERSIONS_SUCCESS,
          data: response
        });
      },
      error(e) {
        AppDispatcher.handleSidebarAction({
          type: REQUEST_VERSIONS_ERROR,
          data: e.message
        });
      }
    });
  },

  sidebarWidthChange() {
    AppDispatcher.handleSidebarAction({
      type: REQUEST_SIDEBAR_WIDTH_CHANGE
    });
  }
};
