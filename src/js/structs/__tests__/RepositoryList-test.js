const Item = require("../Item");
const RepositoryList = require("../RepositoryList");

let thisInstance;

describe("RepositoryList", function() {
  beforeEach(function() {
    var items = [{ foo: "bar" }, { baz: "qux" }];
    thisInstance = new RepositoryList({ items });
  });

  describe("#constructor", function() {
    it("creates instances of Item", function() {
      var items = thisInstance.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });
  });

  describe("#getPriority", function() {
    it("returns correct priority of existing item", function() {
      var priority = thisInstance.getPriority(thisInstance.getItems()[1]);
      expect(priority).toEqual(1);
    });

    it("returns -1 for non-existing item", function() {
      var priority = thisInstance.getPriority({ not: "available" });
      expect(priority).toEqual(-1);
    });

    it("returns -1 for undefined", function() {
      var priority = thisInstance.getPriority(undefined);
      expect(priority).toEqual(-1);
    });

    it("returns -1 for null", function() {
      var priority = thisInstance.getPriority(null);
      expect(priority).toEqual(-1);
    });
  });
});
