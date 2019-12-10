import Item from "../Item";
import RepositoryList from "../RepositoryList";

let thisInstance;

describe("RepositoryList", () => {
  beforeEach(() => {
    var items = [{ foo: "bar" }, { baz: "qux" }];
    thisInstance = new RepositoryList({ items });
  });

  describe("#constructor", () => {
    it("creates instances of Item", () => {
      var items = thisInstance.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });
  });

  describe("#getPriority", () => {
    it("returns correct priority of existing item", () => {
      var priority = thisInstance.getPriority(thisInstance.getItems()[1]);
      expect(priority).toEqual(1);
    });

    it("returns -1 for non-existing item", () => {
      var priority = thisInstance.getPriority({ not: "available" });
      expect(priority).toEqual(-1);
    });

    it("returns -1 for undefined", () => {
      var priority = thisInstance.getPriority(undefined);
      expect(priority).toEqual(-1);
    });

    it("returns -1 for null", () => {
      var priority = thisInstance.getPriority(null);
      expect(priority).toEqual(-1);
    });
  });
});
