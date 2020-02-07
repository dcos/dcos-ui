import PluginTestUtils from "PluginTestUtils";
import { RequestUtil } from "mesosphere-shared-reactjs";
import * as EventTypes from "../../constants/EventTypes";
import * as ActionTypes from "../../constants/ActionTypes";

const SDK = PluginTestUtils.getSDK("cluster-linking", { enabled: true });
require("../../SDK").setSDK(SDK);
const ClusterLinkingStore = require("../ClusterLinkingStore").default;
const clusterLinkingListFixture = require("../../../../tests/_fixtures/cluster-linking/cluster-list.json");

let thisRequestFn, thisClusterLinkingListFixture;

describe("ClusterLinkingStore", () => {
  describe("#fetchClusterLinkingList", () => {
    beforeEach(() => {
      thisRequestFn = RequestUtil.json;
      RequestUtil.json = handlers => {
        handlers.success({
          ...clusterLinkingListFixture
        });
      };
      thisClusterLinkingListFixture = {
        ...clusterLinkingListFixture
      };
    });

    afterEach(() => {
      RequestUtil.json = thisRequestFn;
    });

    it("returns a list of Clusters", () => {
      ClusterLinkingStore.fetchClusterLinkingList();
      const clusterList = ClusterLinkingStore.getLinkedClusters();
      expect(clusterList instanceof Array).toBeTruthy();
    });

    it("returns the cluster list it was given", () => {
      ClusterLinkingStore.fetchClusterLinkingList();
      const clusterList = ClusterLinkingStore.getLinkedClusters();
      expect(clusterList.length).toEqual(3);

      const cluster = clusterList[0].getName();
      expect(cluster).toEqual("cluster-a");
    });

    describe("dispatcher", () => {
      it("stores cluster list when event is dispatched", () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_CLUSTER_LIST_SUCCESS,
          data: thisClusterLinkingListFixture
        });

        const clusterList = ClusterLinkingStore.getLinkedClusters();
        expect(clusterList.length).toEqual(3);
      });

      it("dispatches the correct event upon success", () => {
        const mockedFn = jest.fn();
        ClusterLinkingStore.addChangeListener(
          EventTypes.CLUSTER_LIST_SUCCESS,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_CLUSTER_LIST_SUCCESS,
          data: thisClusterLinkingListFixture
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it("dispatches the correct event upon error", () => {
        const mockedFn = jest.fn();
        ClusterLinkingStore.addChangeListener(
          EventTypes.CLUSTER_LIST_ERROR,
          mockedFn
        );
        SDK.dispatch({
          type: ActionTypes.REQUEST_CLUSTER_LIST_ERROR,
          data: { message: "error" }
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });
    });
  });
});
