import Backend from "../Backend";
import BackendList from "../BackendList";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

describe("BackendList", () => {
  describe("#constructor", () => {
    it("creates instances of Backend", () => {
      let items = [{ foo: "bar" }];
      const list = new BackendList({ items });
      items = list.getItems();
      expect(items[0] instanceof Backend).toBeTruthy();
    });
  });
});
