import SecretStoreStruct from "../SecretStoreStruct";
import SecretStoreStructList from "../SecretStoreStructList";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);

describe("SecretStoreStructList", () => {
  describe("#constructor", () => {
    it("creates instances of SecretStoreStruct", () => {
      let items = [{ foo: "bar" }];
      const list = new SecretStoreStructList({ items });
      items = list.getItems();
      expect(items[0] instanceof SecretStoreStruct).toBeTruthy();
    });
  });

  describe("#getSealedCount", () => {
    it("returns 0 if list is empty", () => {
      const list = new SecretStoreStructList();

      expect(list.getSealedCount()).toEqual(0);
    });

    it("returns 0 if list does not have any sealed stores", () => {
      const list = new SecretStoreStructList({
        items: [{ sealed: false }]
      });

      expect(list.getSealedCount()).toEqual(0);
    });

    it("returns 3 if list has 3 sealed stores", () => {
      const list = new SecretStoreStructList({
        items: [
          { sealed: true },
          { sealed: true },
          { sealed: false },
          { sealed: true }
        ]
      });

      expect(list.getSealedCount()).toEqual(3);
    });
  });
});
