import SecretsList from "../SecretsList";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);

const Secret = require("../../structs/Secret").default;

describe("SecretsList", () => {
  describe("#constructor", () => {
    it("creates instances of Secret", () => {
      let items = [{ foo: "bar" }];
      const list = new SecretsList({ items });
      items = list.getItems();
      expect(items[0] instanceof Secret).toBeTruthy();
    });
  });
});
