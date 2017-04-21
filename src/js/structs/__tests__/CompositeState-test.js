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
      expect(CompositeState.data).toEqual({ foo: "bar" });
    });
  });

  describe("#addSummary", function() {
    it("adds an object to state", function() {
      CompositeState.addSummary({ foo: "bar" });
      expect(CompositeState.data).toEqual({ foo: "bar" });
    });
  });

  describe("#addMarathonApps", function() {
    it("adds marathon metadata to an existing framework, matching by id", function() {
      CompositeState.addState({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            bar: "baz"
          }
        ]
      });

      CompositeState.addMarathonApps({
        foo: {
          qux: "quux",
          corge: "grault"
        }
      });

      expect(CompositeState.data.frameworks[0]._meta).toEqual({
        marathon: {
          qux: "quux",
          corge: "grault"
        }
      });
    });

    it("replaced old marathon data with new marathon data", function() {
      CompositeState.addState({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            bar: "baz"
          }
        ]
      });

      CompositeState.addMarathonApps({
        foo: {
          qux: "quux",
          corge: "grault"
        }
      });

      CompositeState.addMarathonApps({
        foo: {
          grault: "garply"
        }
      });

      expect(CompositeState.data.frameworks[0]._meta).toEqual({
        marathon: {
          grault: "garply"
        }
      });
    });

    it("does not add marathon data if it doesn't find a matching id", function() {
      CompositeState.addState({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            bar: "baz"
          }
        ]
      });

      CompositeState.addMarathonApps({
        bar: {
          qux: "quux",
          corge: "grault"
        }
      });

      expect(CompositeState.data.frameworks[0]._meta).toBeUndefined();
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
      expect(CompositeState.addNodeHealth).not.toThrow();
    });
  });

  describe("#mergeData", function() {
    it("deeply merges old and new states", function() {
      CompositeState.addState({ foo: "bar" });
      CompositeState.addState({
        baz: {
          qux: "quux",
          corge: {
            grault: "garply",
            fred: "plugh"
          }
        }
      });
      CompositeState.addState({
        baz: {
          qux: "quux",
          corge: {
            fred: "foo"
          },
          xyzzy: ["thud", "bar"]
        }
      });

      expect(CompositeState.data).toEqual({
        foo: "bar",
        baz: {
          qux: "quux",
          corge: {
            grault: "garply",
            fred: "foo"
          },
          xyzzy: ["thud", "bar"]
        }
      });
    });

    it("merges old and new states, overwriting old with new", function() {
      CompositeState.addState({ foo: "bar" });
      CompositeState.addState({ baz: "qux" });
      CompositeState.addState({ foo: "baz" });
      expect(CompositeState.data).toEqual({ foo: "baz", baz: "qux" });
    });

    it("merges framework data set with both addState and addSummary", function() {
      CompositeState.addState({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            baz: {
              qux: "quux",
              fred: "plugh"
            }
          },
          {
            id: "baz-id",
            name: "baz",
            baz: {
              qux: "quux",
              corge: "graply"
            }
          }
        ]
      });

      CompositeState.addSummary({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            bar: {
              qux: "grault"
            }
          },
          {
            id: "baz-id",
            name: "baz",
            baz: {
              corge: "quux"
            }
          }
        ]
      });

      expect(CompositeState.data).toEqual({
        frameworks: [
          {
            id: "foo-id",
            name: "foo",
            baz: {
              qux: "quux",
              fred: "plugh"
            },
            bar: {
              qux: "grault"
            }
          },
          {
            id: "baz-id",
            name: "baz",
            baz: {
              corge: "quux"
            }
          }
        ]
      });
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
        frameworks: [
          {
            id: "bar-id",
            name: "bar",
            bar: "baz"
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

      CompositeState.addMarathonApps({
        foo: {
          qux: "quux",
          corge: "grault"
        }
      });

      var expectedResult = [
        {
          id: "foo-id",
          name: "foo",
          bar: "baz",
          _meta: {
            marathon: {
              qux: "quux",
              corge: "grault"
            }
          }
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
            _itemData: { id: "foo-id", hostname: "foo" }
          },
          {
            id: "qq-id",
            hostname: "qq",
            _itemData: { id: "qq-id", hostname: "qq" }
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
});
