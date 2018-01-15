const DirectoryItem = require("../DirectoryItem");
const TaskDirectory = require("../TaskDirectory");

describe("TaskDirectory", function() {
  beforeEach(function() {
    var items = [{ path: "/some/path/to/bar" }];
    this.directory = new TaskDirectory({ items });
  });

  describe("#constructor", function() {
    it("creates instances of DirectoryItem", function() {
      var items = this.directory.getItems();
      expect(items[0] instanceof DirectoryItem).toBeTruthy();
    });
  });

  describe("#findFile", function() {
    it("returns undefined when item is not is list", function() {
      expect(this.directory.findFile("quis")).toEqual(undefined);
    });

    it("returns the file when item is not is list", function() {
      expect(this.directory.findFile("bar").get("path")).toEqual(
        "/some/path/to/bar"
      );
    });
  });
});
