import PluginSDK from "PluginSDK";
import { RequestUtil } from "mesosphere-shared-reactjs";
import ClusterLinkingActions from "../ClusterLinkingActions";

const SDK = PluginSDK.__getSDK("cluster-linking", { enabled: true });
require("../../SDK").setSDK(SDK);

import * as ActionTypes from "../../constants/ActionTypes";
const clusterLinkingListFixture = require("../../../../tests/_fixtures/cluster-linking/cluster-list.json");

let thisConfiguration;

describe("ClusterLinkingActions", () => {
  describe("#fetchClusterLinkingList", () => {
    beforeEach(() => {
      spyOn(RequestUtil, "json");
      ClusterLinkingActions.fetchClusterLinkingList();
      thisConfiguration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("dispatches the correct action when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_CLUSTER_LIST_SUCCESS);
      });

      thisConfiguration.success(clusterLinkingListFixture);
    });

    it("dispatches with the correct data when successful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.data).toEqual(clusterLinkingListFixture);
      });

      thisConfiguration.success(clusterLinkingListFixture);
    });

    it("dispatches the correct action when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.type).toEqual(ActionTypes.REQUEST_CLUSTER_LIST_ERROR);
      });

      thisConfiguration.error({ message: "error" });
    });

    it("dispatches with the correct data when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.data).toEqual("error");
      });

      thisConfiguration.error({ responseJSON: { message: "error" } });
    });

    it("dispatches the xhr when unsuccessful", () => {
      const unsubscribe = SDK.onDispatch((action) => {
        unsubscribe();
        expect(action.xhr).toEqual({ message: "error" });
      });

      thisConfiguration.error({ message: "error" });
    });

    it("calls #json from the RequestUtil", () => {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", () => {
      expect(thisConfiguration.url).toEqual("/cluster/v1/links");
    });

    it("sends a GET request", () => {
      expect(thisConfiguration.method).toEqual("GET");
    });
  });
});
