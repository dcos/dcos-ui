import DirectoryItem from "../DirectoryItem";
import TaskDirectory from "../TaskDirectory";

let thisDirectory;

describe("TaskDirectory", () => {
  beforeEach(() => {
    const items = [{ path: "/some/path/to/bar" }];
    thisDirectory = new TaskDirectory({ items });
  });

  describe("#constructor", () => {
    it("creates instances of DirectoryItem", () => {
      const items = thisDirectory.getItems();
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
