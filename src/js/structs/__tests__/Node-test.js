const Node = require("../Node");

describe("Node", () => {
  describe("#getServices", () => {
    it("returns ids of services running on node", () => {
      const node = new Node({ framework_ids: [1, 2, 3] });
      expect(node.getServiceIDs()).toEqual([1, 2, 3]);
    });
  });

  describe("#getActive", () => {
    it("return false when node is inactive", () => {
      const node = new Node({ active: false });
      expect(node.isActive()).toBeFalsy();
    });

    it("return true when node is inactive", () => {
      const node = new Node({ active: true });
      expect(node.isActive()).toBeTruthy();
    });
  });

  describe("#getDomain", () => {
    it("returns the domain object of the node", () => {
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

  describe("#getRegionName", () => {
    it("returns name of the region of the node", () => {
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

  describe("#getZoneName", () => {
    it("returns name of the zone of the node", () => {
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

  describe("#getUsageStats", () => {
    describe("with resources from mesos", () => {
      it("returns usage stats for given resource", () => {
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

    describe("without resources from mesos", () => {
      it("returns empty resources and used_resources", () => {
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

  describe("#getResources", () => {
    it("returns empty obj when resources are falsey", () => {
      const node = new Node({
        used_resources: null
      });

      expect(node.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      });
    });
  });

  describe("#isPublic", () => {
    const testCases = [
      {
        name: "returns true if attributes.public_ip is true",
        expected: true,
        value: { attributes: { public_ip: "true" } }
      },
      {
        name: "returns false if attributes.public_ip is false",
        expected: false,
        value: { attributes: { public_ip: "false" } }
      },
      {
        name: "returns false if attributes.public_ip is missing",
        expected: false,
        value: { attributes: {} }
      },
      {
        name: "returns false if attributes is missing",
        expected: false,
        value: {}
      }
    ];

    testCases.forEach(test => {
      it(test.name, () => {
        const node = new Node(test.value);
        expect(node.isPublic()).toEqual(test.expected);
      });
    });
  });
});
