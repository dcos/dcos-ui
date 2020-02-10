import NetworkingActions from "../NetworkingActions";

import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });

require("../../../../SDK").setSDK(SDK);

import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";

let thisConfiguration, thisRequestUtilJSON, thisRootUrl, thisUseFixtures;

describe("NetworkingActions", () => {
  beforeEach(() => {
    thisConfiguration = null;
    thisRequestUtilJSON = RequestUtil.json;
    thisRootUrl = Config.rootUrl;
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = false;
    Config.rootUrl = "";
    RequestUtil.json = configuration => {
      thisConfiguration = configuration;
    };
  });

  afterEach(() => {
    Config.rootUrl = thisRootUrl;
    Config.useFixtures = thisUseFixtures;
    RequestUtil.json = thisRequestUtilJSON;
  });

  describe("#fetchVIPs", () => {
    it("dispatches the correct action when successful", () => {
      NetworkingActions.fetchVIPs();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_VIPS_SUCCESS,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.success({ array: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      NetworkingActions.fetchVIPs();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_VIPS_ERROR,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } }
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      NetworkingActions.fetchVIPs();
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#fetchVIPDetail", () => {
    it("dispatches the correct action when successful", () => {
      NetworkingActions.fetchVIPDetail("foo", "bar", "baz");
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_VIP_DETAIL_SUCCESS,
          data: { bar: "baz" },
          vip: "foo:bar:baz"
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      NetworkingActions.fetchVIPDetail("foo", "bar", "baz");
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_VIP_DETAIL_ERROR,
          data: { bar: "baz" },
          vip: "foo:bar:baz"
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } }
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      NetworkingActions.fetchVIPDetail("foo", "bar", "baz");
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      NetworkingActions.fetchVIPDetail("foo", "bar", "baz");
      expect(thisConfiguration.url).toEqual(
        Config.networkingAPIPrefix + "/bar/foo/baz"
      );
    });
  });

  describe("#fetchVIPBackendConnections", () => {
    it("dispatches the correct action when successful", () => {
      NetworkingActions.fetchVIPBackendConnections("foo", "bar", "baz");
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS,
          data: { bar: "baz" },
          vip: "foo:bar:baz"
        });
      });

      thisConfiguration.success({ bar: "baz" });
    });

    it("dispatches the correct action when unsuccessful", () => {
      NetworkingActions.fetchVIPBackendConnections("foo", "bar", "baz");
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_BACKEND_CONNECTIONS_ERROR,
          data: { bar: "baz" },
          vip: "foo:bar:baz"
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } }
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      NetworkingActions.fetchVIPBackendConnections("foo", "bar", "baz");
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      NetworkingActions.fetchVIPBackendConnections("foo", "bar", "baz");
      expect(thisConfiguration.url).toEqual(
        Config.networkingAPIPrefix + "/backend-connections/bar/foo/baz"
      );
    });
  });

  describe("#fetchNodeMemberships", () => {
    it("dispatches the correct action when successful", () => {
      NetworkingActions.fetchNodeMemberships();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.success({ array: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      NetworkingActions.fetchNodeMemberships();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_ERROR,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } }
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      NetworkingActions.fetchNodeMemberships();
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });

  describe("#fetchVIPSummaries", () => {
    it("dispatches the correct action when successful", () => {
      NetworkingActions.fetchVIPSummaries();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_VIP_SUMMARIES_SUCCESS,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.success({ array: { bar: "baz" } });
    });

    it("dispatches the correct action when unsuccessful", () => {
      NetworkingActions.fetchVIPSummaries();
      const unsubscribe = SDK.onDispatch(action => {
        unsubscribe();
        expect(action).toEqual({
          type: ActionTypes.REQUEST_NETWORKING_VIP_SUMMARIES_ERROR,
          data: { bar: "baz" }
        });
      });

      thisConfiguration.error({
        responseJSON: { description: { bar: "baz" } }
      });
    });

    it("calls #json from the RequestUtil", () => {
      spyOn(RequestUtil, "json");
      NetworkingActions.fetchVIPSummaries();
      expect(RequestUtil.json).toHaveBeenCalled();
    });
  });
});
