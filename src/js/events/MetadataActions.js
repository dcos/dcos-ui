import { RequestUtil } from "mesosphere-shared-reactjs";
import { Hooks } from "PluginSDK";

import ActionTypes from "../constants/ActionTypes";
import AppDispatcher from "./AppDispatcher";
import Config from "../config/Config";

var MetadataActions = {
  fetchDCOSBuildInfo() {
    const host = Config.rootUrl.replace(/:[0-9]{0,4}$/, "");
    const url = host + "/pkgpanda/active.buildinfo.full.json";

    RequestUtil.json({
      url,
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_DCOS_BUILD_INFO_SUCCESS,
          data: response
        });
      },
      error(xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_DCOS_BUILD_INFO_ERROR,
          data: xhr.message,
          xhr
        });
      }
    });
  },

  fetch() {
    // Checks capability to metadata API
    if (!Hooks.applyFilter("hasCapability", false, "metadataAPI")) {
      return;
    }

    RequestUtil.json({
      url: Config.rootUrl + "/metadata",
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METADATA,
          data: response
        });
      }
    });

    RequestUtil.json({
      url: Config.rootUrl + "/dcos-metadata/dcos-version.json",
      success(response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_DCOS_METADATA,
          data: response
        });
      }
    });
  }
};

module.exports = MetadataActions;
