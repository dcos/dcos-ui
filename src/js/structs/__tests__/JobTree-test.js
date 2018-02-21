const Job = require("../Job");
const JobTree = require("../JobTree");

let thisInstance;

describe("JobTree", function() {
  describe("#constructor", function() {
    beforeEach(function() {
      thisInstance = new JobTree({
        id: "group",
        items: [
          { id: "group.foo", items: [] },
          { id: "group.bar", items: [] },
          { id: "group.alpha" },
          { id: "group.beta" }
        ]
      });
    });

    it("defaults id to slash (root group id)", function() {
      const tree = new JobTree({ items: [] });
      expect(tree.getId()).toEqual("");
    });

    it("sets correct tree id", function() {
      expect(thisInstance.getId()).toEqual("group");
    });

    it("accepts nested trees (groups)", function() {
      expect(thisInstance.getItems()[0] instanceof JobTree).toEqual(true);
    });

    it("converts tree like items into instances of JobTree", function() {
      expect(thisInstance.getItems()[1] instanceof JobTree).toEqual(true);
    });

    it("converts items into instances of Job", function() {
      expect(thisInstance.getItems()[2] instanceof Job).toEqual(true);
    });
  });
});
