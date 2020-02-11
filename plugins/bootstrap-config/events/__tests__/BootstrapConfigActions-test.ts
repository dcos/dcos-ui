import BootstrapConfigActions from "../BootstrapConfigActions";

import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("bootstrapConfig", { enabled: true });
require("../../SDK").setSDK(SDK);

import * as ActionTypes from "../../constants/ActionTypes";

import Config from "#SRC/js/config/Config";

let thisCall;

describe("BootstrapConfigActions", () => {
  describe("#fetchBootstrapConfig", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      BootstrapConfigActions.fetchBootstrapConfig();
      thisCall = RequestUtil.json.calls.mostRecent();
    });

    it("fetches data from the metadata bootstrap config endpoint", () => {
      expect(RequestUtil.json).toHaveBeenCalledWith({
        url: `${Config.rootUrl}/dcos-metadata/bootstrap-config.json`,
        success: jasmine.any(Function),
        error: jasmine.any(Function)
      });
    });

    it("dispatches the appropriate action when successful", done => {
      const { success } = thisCall.args[0];
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_BOOTSTRAP_CONFIG_SUCCESS,
          data: { foo: "bar" }
        });
        done();
      });

      success({ foo: "bar" });
    });

    it("dispatches the appropriate action when unsuccessful", done => {
      const { error } = thisCall.args[0];
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_BOOTSTRAP_CONFIG_ERROR);
        done();
      });

      error();
    });
  });
});
