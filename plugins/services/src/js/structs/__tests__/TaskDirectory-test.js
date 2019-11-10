const DirectoryItem = require("../DirectoryItem");
const TaskDirectory = require("../TaskDirectory");

let thisDirectory;

describe("TaskDirectory", () => {
  beforeEach(() => {
    var items = [{ path: "/some/path/to/bar" }];
    thisDirectory = new TaskDirectory({ items });
  });

  describe("#constructor", () => {
    it("creates instances of DirectoryItem", () => {
      var items = thisDirectory.getItems();
      expect(items[0] instanceof DirectoryItem).toBeTruthy();
    });
  });

  describe("#findFile", () => {
    it("returns undefined when item is not is list", () => {
      expect(thisDirectory.findFile("quis")).toEqual(undefined);
    });

    it("returns the file when item is not is list", () => {
      expect(thisDirectory.findFile("bar").get("path")).toEqual(
        "/some/path/to/bar"
      );
    });
  });
});
