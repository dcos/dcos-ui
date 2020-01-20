import VIPSummary from "../VIPSummary";
import VIPSummaryList from "../VIPSummaryList";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

describe("VIPSummaryList", () => {
  describe("#constructor", () => {
    it("creates instances of VIPSummary", () => {
      let items = [{ foo: "bar" }];
      const list = new VIPSummaryList({ items });
      items = list.getItems();
      expect(items[0] instanceof VIPSummary).toBeTruthy();
    });
  });
});
