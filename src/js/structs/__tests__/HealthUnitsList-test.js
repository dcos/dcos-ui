const HealthUnit = require("../HealthUnit");
const HealthUnitsList = require("../HealthUnitsList");

describe("HealthUnitsList", function() {
  describe("#constructor", function() {
    it("creates instances of HealthUnit", function() {
      let items = [{ foo: "bar" }];
      const list = new HealthUnitsList({ items });
      items = list.getItems();
      expect(items[0] instanceof HealthUnit).toBeTruthy();
    });
  });

  describe("#filter", function() {
    it("returns unfiltered list", function() {
      const items = [{ a: 1 }, { b: 2 }];
      const list = new HealthUnitsList({ items });
      expect(list.filter().getItems().length).toEqual(2);
    });

    it("filters by title", function() {
      const items = [{ id: "foo" }, { id: "foobar" }, { id: "baz" }];
      const list = new HealthUnitsList({ items });
      const filteredList = list.filter({ title: "ba" }).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get("id")).toEqual("baz");
      expect(filteredList[1].get("id")).toEqual("foobar");
    });

    it("filters by unit health title", function() {
      const items = [
        { id: "foo", health: 0 },
        { id: "bar", health: 0 },
        { id: "bluh", health: 2 }
      ];
      const list = new HealthUnitsList({ items });
      const filteredList = list.filter({ health: "healthy" }).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get("id")).toEqual("foo");
      expect(filteredList[1].get("id")).toEqual("bar");
    });
  });
});
