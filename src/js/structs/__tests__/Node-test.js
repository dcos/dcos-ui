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

  describe("#getDomain", function() {
    it("returns the domain object of the node", function() {
      const node = new Node({
        domain: {
          fault_domain: {
            region: {
              name: "foo"
            },
            zone: {
              name: "bar"
            }
          }
        }
      });

      expect(node.getDomain()).toEqual({
        fault_domain: {
          region: {
            name: "foo"
          },
          zone: {
            name: "bar"
          }
        }
      });
    });
  });

  describe("#getRegionName", function() {
    it("returns name of the region of the node", function() {
      const node = new Node({
        domain: {
          fault_domain: {
            region: {
              name: "foo"
            },
            zone: {
              name: "bar"
            }
          }
        }
      });

      expect(node.getRegionName()).toEqual("foo");
    });
  });

  describe("#getZoneName", function() {
    it("returns name of the zone of the node", function() {
      const node = new Node({
        domain: {
          fault_domain: {
            region: {
              name: "foo"
            },
            zone: {
              name: "bar"
            }
          }
        }
      });

      expect(node.getZoneName()).toEqual("bar");
    });
  });

  describe("#getUsageStats", function() {
    describe("with resources from mesos", function() {
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

    describe("without resources from mesos", function() {
      it("returns empty resources and used_resources", function() {
        const node = new Node({
          resources: null,
          used_resources: undefined
        });
        const stats = {
          percentage: 0,
          total: 0,
          value: 0
        };

        expect(node.getUsageStats("cpus")).toEqual(stats);
      });
    });
  });

  describe("#getUsedResources", function() {
    it("returns empty obj when resources are falsey", function() {
      const node = new Node({
        used_resources: null
      });

      expect(node.getUsedResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      });
    });
  });
});
