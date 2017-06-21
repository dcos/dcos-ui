const UniversePackage = require("../UniversePackage");
const UniverseInstalledPackagesList = require("../UniverseInstalledPackagesList");

describe("UniverseInstalledPackagesList", function() {
  describe("#constructor", function() {
    it("creates instances of UniversePackage", function() {
      var items = [{ appId: "baz", foo: "bar" }];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.getItems();
      expect(items[0] instanceof UniversePackage).toBeTruthy();
    });

    it("should store appId in UniversePackage", function() {
      var items = [{ appId: "baz", foo: "bar" }];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.getItems();
      expect(items[0].get("appId")).toEqual("baz");
    });

    it("should store packageInformation in UniversePackage", function() {
      var items = [{ appId: "baz", foo: "bar" }];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.getItems();
      expect(items[0].get("foo")).toEqual("bar");
    });
  });

  describe("#filterItemsByText", function() {
    it("should filter by name", function() {
      var items = [
        { appId: "baz", name: "foo" },
        { appId: "baz", name: "bar" }
      ];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.filterItemsByText("bar").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].getName()).toEqual("bar");
    });

    it("should filter by description", function() {
      var items = [
        { appId: "baz", description: "foo" },
        { appId: "baz", description: "bar" }
      ];
      var list = new UniverseInstalledPackagesList({ items });
      items = list.filterItemsByText("foo").getItems();
      expect(items.length).toEqual(1);
      expect(items[0].getDescription()).toEqual("foo");
    });

    it("should filter by tags", function() {
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

    it("should handle filter by tags with null elements", function() {
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
