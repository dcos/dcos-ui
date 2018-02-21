const DirectoryItem = require("../DirectoryItem");
const TaskDirectory = require("../TaskDirectory");

let thisDirectory;

describe("TaskDirectory", function() {
  beforeEach(function() {
    var items = [{ path: "/some/path/to/bar" }];
    thisDirectory = new TaskDirectory({ items });
  });

  describe("#constructor", function() {
    it("creates instances of DirectoryItem", function() {
      var items = thisDirectory.getItems();
      expect(items[0] instanceof DirectoryItem).toBeTruthy();
    });
  });

  describe("#findFile", function() {
    it("returns undefined when item is not is list", function() {
      expect(thisDirectory.findFile("quis")).toEqual(undefined);
    });

    it("returns the file when item is not is list", function() {
      expect(thisDirectory.findFile("bar").get("path")).toEqual(
        "/some/path/to/bar"
      );
    });
  });
});
