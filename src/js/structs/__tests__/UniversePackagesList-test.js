import UniversePackage from "../UniversePackage";
import UniversePackagesList from "../UniversePackagesList";

describe("UniversePackagesList", () => {
  describe("#constructor", () => {
    it("creates instances of UniversePackage", () => {
      var items = [{ foo: "bar" }];
      var list = new UniversePackagesList({ items });
      items = list.getItems();
      expect(items[0] instanceof UniversePackage).toBeTruthy();
    });
  });

  describe("#filterItemsByText", () => {
    it("filters by name", () => {
      var items = [{ name: "foo" }, { name: "bar" }];
      var list = new UniversePackagesList({ items });
      items = list.filterItemsByText("bar").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].get("name")).toEqual("bar");
    });

    it("sorts exact matches first", () => {
      var items = [{ name: "kafka-beta" }, { name: "kafka" }];
      var list = new UniversePackagesList({ items });
      items = list.filterItemsByText("kafka").getItems();
      expect(items.length).toEqual(2);
      expect(items[0].get("name")).toEqual("kafka");
    });

    it("filters by description", () => {
      var items = [{ description: "foo" }, { description: "bar" }];
      var list = new UniversePackagesList({ items });
      items = list.filterItemsByText("foo").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].get("description")).toEqual("foo");
    });

    it("filters by tags", () => {
      var items = [
        { tags: ["word", "foo", "bar"] },
        { tags: ["foo"] },
        { tags: [] }
      ];

      var list = new UniversePackagesList({ items });
      items = list.filterItemsByText("foo").getItems();
      expect(items.length).toEqual(2);
      expect(items[0].get("tags")).toEqual(["foo"]);
      expect(items[1].get("tags")).toEqual(["word", "foo", "bar"]);
    });

    it("handles filter by tags with null elements", () => {
      var items = [{ tags: ["foo", "bar"] }, { tags: ["foo"] }, { tags: null }];
      var list = new UniversePackagesList({ items });
      expect(list.filterItemsByText.bind(list, "foo")).not.toThrow();
    });
  });
});
