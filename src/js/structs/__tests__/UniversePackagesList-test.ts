import UniversePackage from "../UniversePackage";
import UniversePackagesList from "../UniversePackagesList";

describe("UniversePackagesList", () => {
  describe("#constructor", () => {
    it("creates instances of UniversePackage", () => {
      let items = [{ foo: "bar" }];
      const list = new UniversePackagesList({ items });
      items = list.getItems();
      expect(items[0] instanceof UniversePackage).toBeTruthy();
    });
  });

  describe("#filterItemsByText", () => {
    it("filters by name", () => {
      let items = [{ name: "foo" }, { name: "bar" }];
      const list = new UniversePackagesList({ items });
      items = list.filterItemsByText("bar").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].get("name")).toEqual("bar");
    });

    it("sorts exact matches first", () => {
      let items = [{ name: "kafka-beta" }, { name: "kafka" }];
      const list = new UniversePackagesList({ items });
      items = list.filterItemsByText("kafka").getItems();
      expect(items.length).toEqual(2);
      expect(items[0].get("name")).toEqual("kafka");
    });

    it("filters by description", () => {
      let items = [{ description: "foo" }, { description: "bar" }];
      const list = new UniversePackagesList({ items });
      items = list.filterItemsByText("foo").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].get("description")).toEqual("foo");
    });

    it("filters by tags", () => {
      let items = [
        { tags: ["word", "foo", "bar"] },
        { tags: ["foo"] },
        { tags: [] },
      ];

      const list = new UniversePackagesList({ items });
      items = list.filterItemsByText("foo").getItems();
      expect(items.length).toEqual(2);
      expect(items[0].get("tags")).toEqual(["foo"]);
      expect(items[1].get("tags")).toEqual(["word", "foo", "bar"]);
    });

    it("handles filter by tags with null elements", () => {
      const items = [
        { tags: ["foo", "bar"] },
        { tags: ["foo"] },
        { tags: null },
      ];
      const list = new UniversePackagesList({ items });
      expect(list.filterItemsByText.bind(list, "foo")).not.toThrow();
    });
  });
});
