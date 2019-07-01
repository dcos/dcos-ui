const CompositeState = require("../CompositeState");
const NodesList = require("../NodesList");

describe("CompositeState", function() {
  beforeEach(function() {
    CompositeState.constructor({});
  });

  describe("#constructor", function() {
    it("populates data with the object it's given", function() {
      CompositeState.constructor({ foo: "bar" });
      expect(CompositeState.data).toEqual({ foo: "bar" });
    });
  });

  describe("#addState", function() {
    it("adds an object to state", function() {
      CompositeState.addState({ foo: "bar" });
      expect(CompositeState.data).toEqual({ foo: "bar", slaves: [] });
    });

    it("removes framework IDs that were not received in the new data", function() {
      CompositeState.addState({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            bar: "baz"
          }
        ]
      });

      CompositeState.addState({
        frameworks: [
          {
            id: "bar-id",
            name: "bar",
            bar: "baz"
          }
        ]
      });

      expect(CompositeState.data).toEqual({
        slaves: [],
        frameworks: [
          {
            id: "bar-id",
            name: "bar",
            bar: "baz"
          }
        ]
      });
    });

    it("preserves the master_info key", function() {
      CompositeState.addMasterInfo({ foo: "bar" });
      CompositeState.addState({ other_key: "foo-id" });
      CompositeState.addState({ bar: "baz" });

      expect(CompositeState.data).toEqual({
        master_info: { foo: "bar" },
        bar: "baz",
        slaves: []
      });
    });

    it("preserves node health data", function() {
      CompositeState.addState({ slaves: [{ hostname: "foo" }] });
      CompositeState.addNodeHealth([
        {
          host_ip: "foo",
          health: 1
        }
      ]);

      expect(CompositeState.data).toEqual({
        slaves: [
          {
            hostname: "foo",
            health: 1
          }
        ]
      });
    });
  });

  describe("#addNodeHealth", function() {
    beforeEach(function() {
      CompositeState.addState({
        slaves: [
          {
            id: "foo-id",
            hostname: "foo"
          }
        ]
      });
    });

    it("merges raw node health data into existing slave data", function() {
      CompositeState.addNodeHealth([
        {
          host_ip: "foo",
          health: 100
        }
      ]);

      expect(CompositeState.data.slaves[0].health).toEqual(100);
      expect(CompositeState.data.slaves[0].hostname).toEqual("foo");
    });

    it("replaces old health status with new health status", function() {
      CompositeState.addNodeHealth([
        {
          host_ip: "foo",
          health: 5
        }
      ]);

      CompositeState.addNodeHealth([
        {
          host_ip: "foo",
          health: 6
        }
      ]);

      expect(CompositeState.data.slaves[0].health).toEqual(6);
    });

    it("handles null data gracefully", function() {
      expect(() => CompositeState.addNodeHealth()).not.toThrow();
    });

    it("node health data provided for missing health nodes", function() {
      CompositeState.addNodeHealth([
        {
          host_ip: "bar",
          health: 1
        }
      ]);

      CompositeState.addState({
        slaves: [
          { host_ip: "bar", hostname: "bar" },
          { host_ip: "foo", hostname: "foo" }
        ]
      });

      expect(CompositeState.data).toEqual({
        slaves: [
          {
            hostname: "bar",
            host_ip: "bar",
            health: 1
          },
          {
            hostname: "foo",
            host_ip: "foo",
            health: 3
          }
        ]
      });
    });
  });

  describe("#getServiceList", function() {
    it("returns a list with the current frameworks", function() {
      CompositeState.addState({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            bar: "baz"
          },
          {
            id: "quux-id",
            name: "quux",
            corge: "grault"
          }
        ]
      });

      var expectedResult = [
        {
          id: "foo-id",
          name: "foo",
          bar: "baz"
        },
        {
          id: "quux-id",
          name: "quux",
          corge: "grault"
        }
      ];

      var serviceList = CompositeState.getServiceList();

      serviceList.getItems().forEach(function(item) {
        expect(item.get()).toEqual(expectedResult.shift());
      });
    });
  });

  describe("#getNodesList", function() {
    beforeEach(function() {
      CompositeState.addState({
        slaves: [
          {
            id: "foo-id",
            hostname: "foo"
          },
          {
            id: "qq-id",
            hostname: "qq"
          }
        ]
      });
    });

    it("returns the current slaves", function() {
      var expectedResult = {
        list: [
          {
            id: "foo-id",
            hostname: "foo",
            health: 3,
            _itemData: { id: "foo-id", hostname: "foo", health: 3 }
          },
          {
            id: "qq-id",
            hostname: "qq",
            health: 3,
            _itemData: { id: "qq-id", hostname: "qq", health: 3 }
          }
        ],
        filterProperties: {}
      };

      var nodesList = CompositeState.getNodesList();

      expect(nodesList).toEqual(expectedResult);
    });

    it("returns an instance of NodesList", function() {
      var nodesList = CompositeState.getNodesList();

      expect(nodesList instanceof NodesList).toEqual(true);
    });
  });

  describe("#enable & #disable", function() {
    it("does not update state when disabled", function() {
      CompositeState.disable();
      expect(CompositeState._isDisabled()).toBe(true);
      CompositeState.addState({ foo: "bar" });

      expect(CompositeState.data).toEqual({});
    });

    it("does not update addState when disabled", function() {
      CompositeState.disable();

      CompositeState.addState({ foo: "bar" });
      expect(CompositeState.data).toEqual({});
    });

    it("does not update nodehealth when disabled", function() {
      CompositeState.addState({
        slaves: [
          {
            id: "foo-id",
            hostname: "foo"
          }
        ]
      });

      CompositeState.disable();
      CompositeState.addNodeHealth([
        {
          host_ip: "foo",
          health: 100
        }
      ]);

      expect(CompositeState.data.slaves[0].health).not.toEqual(100);
    });

    it("is disabled if there are more disable calls then enables", function() {
      expect(CompositeState._isDisabled()).toBe(false);

      CompositeState.disable();
      expect(CompositeState._isDisabled()).toBe(true);

      CompositeState.disable();
      CompositeState.enable();
      expect(CompositeState._isDisabled()).toBe(true);
    });

    it("is disabled no matter how many enables have been called", function() {
      expect(CompositeState._isDisabled()).toBe(false);

      CompositeState.enable();
      CompositeState.enable();
      CompositeState.enable();
      CompositeState.enable();
      CompositeState.enable();
      CompositeState.enable();
      CompositeState.disable();
      expect(CompositeState._isDisabled()).toBe(true);
    });
  });
});
