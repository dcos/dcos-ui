jest.dontMock("../Item");
jest.dontMock("../RepositoryList");
jest.dontMock("../../utils/Util");

const Item = require("../Item");
const RepositoryList = require("../RepositoryList");

describe("RepositoryList", function() {
  beforeEach(function() {
    var items = [{ foo: "bar" }, { baz: "qux" }];
    this.instance = new RepositoryList({ items });
  });

  describe("#constructor", function() {
    it("creates instances of Item", function() {
      var items = this.instance.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });
  });

  describe("#getPriority", function() {
    it("should return correct priority of existing item", function() {
      var priority = this.instance.getPriority(this.instance.getItems()[1]);
      expect(priority).toEqual(1);
    });

    it("should return -1 for non-existing item", function() {
      var priority = this.instance.getPriority({ not: "available" });
      expect(priority).toEqual(-1);
    });

    it("should return -1 for undefined", function() {
      var priority = this.instance.getPriority(undefined);
      expect(priority).toEqual(-1);
    });

    it("should return -1 for null", function() {
      var priority = this.instance.getPriority(null);
      expect(priority).toEqual(-1);
    });
  });
});
