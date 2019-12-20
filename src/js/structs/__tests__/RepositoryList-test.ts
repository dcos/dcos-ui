import Item from "../Item";
import RepositoryList from "../RepositoryList";

let thisInstance;

describe("RepositoryList", () => {
  beforeEach(() => {
    const items = [{ foo: "bar" }, { baz: "qux" }];
    thisInstance = new RepositoryList({ items });
  });

  describe("#constructor", () => {
    it("creates instances of Item", () => {
      const items = thisInstance.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });
  });

  describe("#getPriority", () => {
    it("returns correct priority of existing item", () => {
      const priority = thisInstance.getPriority(thisInstance.getItems()[1]);
      expect(priority).toEqual(1);
    });

    it("returns -1 for non-existing item", () => {
      const priority = thisInstance.getPriority({ not: "available" });
      expect(priority).toEqual(-1);
    });

    it("returns -1 for undefined", () => {
      const priority = thisInstance.getPriority(undefined);
      expect(priority).toEqual(-1);
    });

    it("returns -1 for null", () => {
      const priority = thisInstance.getPriority(null);
      expect(priority).toEqual(-1);
    });
  });
});
