import UniversePackage from "../UniversePackage";
import UniverseInstalledPackagesList from "../UniverseInstalledPackagesList";

describe("UniverseInstalledPackagesList", () => {
  describe("#constructor", () => {
    it("creates instances of UniversePackage", () => {
      var items = [{ appId: "baz", foo: "bar" }];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.getItems();
      expect(items[0] instanceof UniversePackage).toBeTruthy();
    });

    it("stores appId in UniversePackage", () => {
      var items = [{ appId: "baz", foo: "bar" }];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.getItems();
      expect(items[0].get("appId")).toEqual("baz");
    });

    it("stores packageInformation in UniversePackage", () => {
      var items = [{ appId: "baz", foo: "bar" }];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.getItems();
      expect(items[0].get("foo")).toEqual("bar");
    });
  });

  describe("#filterItemsByText", () => {
    it("filters by name", () => {
      var items = [
        { appId: "baz", name: "foo" },
        { appId: "baz", name: "bar" }
      ];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.filterItemsByText("bar").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].getName()).toEqual("bar");
    });

    it("filters by description", () => {
      var items = [
        { appId: "baz", description: "foo" },
        { appId: "baz", description: "bar" }
      ];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.filterItemsByText("foo").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].getDescription()).toEqual("foo");
    });

    it("filters by tags", () => {
      var items = [
        { appId: "baz", tags: ["foo", "bar"] },
        { appId: "baz", tags: ["foo"] },
        { appId: "baz", tags: [] }
      ];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.filterItemsByText("foo").getItems();
      expect(items.length).toEqual(2);
      expect(items[0].getTags()).toEqual(["foo", "bar"]);
      expect(items[1].getTags()).toEqual(["foo"]);
    });

    it("handles filter by tags with null elements", () => {
      var items = [
        { appId: "baz", tags: ["foo", "bar"] },
        { appId: "baz", tags: ["foo"] },
        { appId: "baz", tags: null }
      ];
      var list = new UniverseInstalledPackagesList({ items });
      expect(list.filterItemsByText.bind(list, "foo")).not.toThrow();
    });
  });
});
