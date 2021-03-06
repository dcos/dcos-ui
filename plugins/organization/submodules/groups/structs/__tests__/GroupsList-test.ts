import Group from "../Group";
import GroupsList from "../GroupsList";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

describe("GroupsList", () => {
  describe("#constructor", () => {
    it("creates instances of Group", () => {
      let items = [{ foo: "bar" }];
      const list = new GroupsList({ items });
      items = list.getItems();
      expect(items[0] instanceof Group).toBeTruthy();
    });
  });
});
