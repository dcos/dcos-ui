import Item from "#SRC/js/structs/Item";
import ACLList from "../ACLList";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

describe("ACLList", () => {
  describe("#constructor", () => {
    it("creates instances of Item", () => {
      let items = [{ foo: "bar" }];
      const list = new ACLList({ items });
      items = list.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });
  });

  describe("#getItem", () => {
    it("returns an instance of Item", () => {
      const items = [{ rid: "bar" }];
      const list = new ACLList({ items });
      const item = list.getItem("bar");
      expect(item instanceof Item).toBeTruthy();
    });

    it("returns the item if it is in the list", () => {
      const items = [{ rid: "bar" }];
      const list = new ACLList({ items });
      const item = list.getItem("bar");
      expect(item.get("rid")).toBe("bar");
    });

    it("returns undefined if the item is not in the list", () => {
      const items = [{ rid: "bar" }];
      const list = new ACLList({ items });
      const item = list.getItem("foo");
      expect(item).toBe(undefined);
    });
  });
});
