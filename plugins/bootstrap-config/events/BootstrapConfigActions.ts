import { RequestUtil } from "mesosphere-shared-reactjs";
import Config from "#SRC/js/config/Config";
import {
  REQUEST_BOOTSTRAP_CONFIG_ERROR,
  REQUEST_BOOTSTRAP_CONFIG_SUCCESS,
} from "../constants/ActionTypes";

import SDK from "PluginSDK";

const BootstrapConfigActions = {
  fetchBootstrapConfig() {
    RequestUtil.json({
      url: `${Config.rootUrl}/dcos-metadata/bootstrap-config.json`,
      success(response) {
        SDK.dispatch({
          type: REQUEST_BOOTSTRAP_CONFIG_SUCCESS,
          data: response,
        });
      },
      error() {
        SDK.dispatch({
          type: REQUEST_BOOTSTRAP_CONFIG_ERROR,
        });
      },
    });
  },
};

export default BootstrapConfigActions;
