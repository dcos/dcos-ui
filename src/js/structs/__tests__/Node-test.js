const Node = require("../Node");

describe("Node", function() {
  describe("#getServices", function() {
    it("returns ids of services running on node", function() {
      const node = new Node({ framework_ids: [1, 2, 3] });
      expect(node.getServiceIDs()).toEqual([1, 2, 3]);
    });
  });

  describe("#getActive", function() {
    it("return false when node is inactive", function() {
      const node = new Node({ active: false });
      expect(node.isActive()).toBeFalsy();
    });

    it("return true when node is inactive", function() {
      const node = new Node({ active: true });
      expect(node.isActive()).toBeTruthy();
    });
  });

  describe("#sumTaskTypesByState", function() {
    it("default to returning 0", function() {
      const node = new Node({});
      expect(node.sumTaskTypesByState("active")).toEqual(0);
    });

    it("sums tasks that match state", function() {
      const node = new Node({
        TASK_STAGING: 1,
        TASK_STARTING: 3,
        TASK_FAILED: 4
      });
      expect(node.sumTaskTypesByState("active")).toEqual(4);
    });

    it("returns 0 if there's tasks that match requested state", function() {
      const node = new Node({ TASK_FAILED: 4 });
      expect(node.sumTaskTypesByState("active")).toEqual(0);
    });
  });

  describe("#getUsageStats", function() {
    it("returns usage stats for given resource", function() {
      const node = new Node({
        resources: { cpus: 10 },
        used_resources: { cpus: 5 }
      });
      const stats = {
        percentage: 50,
        total: 10,
        value: 5
      };

      expect(node.getUsageStats("cpus")).toEqual(stats);
    });
  });
});
