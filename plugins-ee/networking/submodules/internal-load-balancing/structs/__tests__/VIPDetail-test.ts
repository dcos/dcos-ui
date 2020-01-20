import BackendList from "../BackendList";
import VIPDetail from "../VIPDetail";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

import vipDetailFixture from "../../../../../../tests/_fixtures/networking/networking-vip-detail.json";

let thisVipDetail;

describe("VIPDetail", () => {
  beforeEach(() => {
    thisVipDetail = new VIPDetail(vipDetailFixture);
  });

  describe("#getBackends", () => {
    it("returns an instance of BackendList", () => {
      expect(thisVipDetail.getBackends() instanceof BackendList).toBeTruthy();
    });

    it("returns the all of the backends it was given", () => {
      expect(thisVipDetail.getBackends().getItems().length).toEqual(
        vipDetailFixture.backends.length
      );
    });
  });
});
