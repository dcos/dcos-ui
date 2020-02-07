import Client from "../Client";
import ClientList from "../ClientList";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

describe("ClientList", () => {
  describe("#constructor", () => {
    it("creates instances of Client", () => {
      let items = [{ foo: "bar" }];
      const list = new ClientList({ items });
      items = list.getItems();
      expect(items[0] instanceof Client).toBeTruthy();
    });
  });
});
