import JobTree from "../JobTree";

import Job from "../Job";

let thisInstance;

describe("JobTree", () => {
  describe("#constructor", () => {
    beforeEach(() => {
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

    it("defaults id to slash (root group id)", () => {
      const tree = new JobTree({ items: [] });
      expect(tree.getId()).toEqual("");
    });

    it("sets correct tree id", () => {
      expect(thisInstance.getId()).toEqual("group");
    });

    it("accepts nested trees (groups)", () => {
      expect(thisInstance.getItems()[0] instanceof JobTree).toEqual(true);
    });

    it("converts tree like items into instances of JobTree", () => {
      expect(thisInstance.getItems()[1] instanceof JobTree).toEqual(true);
    });

    it("converts items into instances of Job", () => {
      expect(thisInstance.getItems()[2] instanceof Job).toEqual(true);
    });
  });
});
