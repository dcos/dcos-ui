import DirectoryItem from "../DirectoryItem";

describe("DirectoryItem", () => {
  describe("#getName", () => {
    it("returns the last name in the path", () => {
      const directoryItem = new DirectoryItem({ path: "/foo/bar/quis/lo" });
      expect(directoryItem.getName()).toEqual("lo");
    });

    it("returns empty string when path ends with '/'", () => {
      const directoryItem = new DirectoryItem({ path: "/foo/bar/quis/lo/" });
      expect(directoryItem.getName()).toEqual("");
    });
  });

  describe("#isDirectory", () => {
    it("returns false when nlink is not present", () => {
      const directoryItem = new DirectoryItem({});
      expect(directoryItem.isDirectory()).toEqual(false);
    });

    it("returns false when nlink is 1 or below", () => {
      const directoryItem = new DirectoryItem({ nlink: 1 });
      expect(directoryItem.isDirectory()).toEqual(false);
    });

    it("returns false when nlink is 2 or above", () => {
      const directoryItem = new DirectoryItem({ nlink: 2 });
      expect(directoryItem.isDirectory()).toEqual(true);
    });
  });
});
