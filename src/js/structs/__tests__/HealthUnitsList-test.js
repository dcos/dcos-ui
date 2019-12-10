import HealthUnit from "../HealthUnit";
import HealthUnitsList from "../HealthUnitsList";

describe("HealthUnitsList", () => {
  describe("#constructor", () => {
    it("creates instances of HealthUnit", () => {
      let items = [{ foo: "bar" }];
      const list = new HealthUnitsList({ items });
      items = list.getItems();
      expect(items[0] instanceof HealthUnit).toBeTruthy();
    });
  });

  describe("#filter", () => {
    it("returns unfiltered list", () => {
      const items = [{ a: 1 }, { b: 2 }];
      const list = new HealthUnitsList({ items });
      expect(list.filter().getItems().length).toEqual(2);
    });

    it("filters by title", () => {
      const items = [{ id: "foo" }, { id: "foobar" }, { id: "baz" }];
      const list = new HealthUnitsList({ items });
      const filteredList = list.filter({ title: "ba" }).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get("id")).toEqual("baz");
      expect(filteredList[1].get("id")).toEqual("foobar");
    });

    it("filters by unit health title", () => {
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
