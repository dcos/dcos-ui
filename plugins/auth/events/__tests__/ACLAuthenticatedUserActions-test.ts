import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("networking", { enabled: true });

require("../../SDK").setSDK(SDK);

const ACLAuthenticatedUserActions = require("../ACLAuthenticatedUserActions")
  .default;
import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration;

describe("ACLAuthenticatedUserActions", () => {
  describe("#fetchPermissions", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ACLAuthenticatedUserActions.fetchPermissions("foo");
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual(
        Config.acsAPIPrefix + "/users/foo/permissions"
      );
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PERMISSIONS_SUCCESS);
      });

      thisConfiguration.success();
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_PERMISSIONS_ERROR);
      });

      thisConfiguration.error({});
    });
  });
});
