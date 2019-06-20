const Service = require("../Service");

describe("Service", function() {
  describe("#getId", function() {
    it("returns correct id", function() {
      const service = new Service({
        id: "/test/cmd"
      });

      expect(service.getId()).toEqual("/test/cmd");
    });
  });

  describe("#getMesosId", function() {
    it("returns correct id prefix", function() {
      const service = new Service({
        id: "/test/cmd"
      });

      expect(service.getMesosId()).toEqual("test_cmd");
    });
  });

  describe("#getResources", function() {
    it("returns default correct resource data", function() {
      expect(new Service().getResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      });
    });

    it("returns correct resource data for a single instance", function() {
      expect(
        new Service({
          getSpec() {
            return {
              get(attribute) {
                return this[attribute];
              },
              getResources() {
                return {
                  cpus: 20,
                  mem: 10,
                  gpus: 0,
                  disk: 0
                };
              }
            };
          },
          getInstancesCount() {
            return 1;
          }
        }).getResources()
      ).toEqual({
        cpus: 20,
        mem: 10,
        gpus: 0,
        disk: 0
      });
    });

    it("returns correct resource data for multiple instances", function() {
      expect(
        new Service({
          getSpec() {
            return {
              get(attribute) {
                return this[attribute];
              },
              getResources() {
                return {
                  cpus: 20,
                  mem: 10,
                  gpus: 0,
                  disk: 0
                };
              }
            };
          },
          getInstancesCount() {
            return 2;
          }
        }).getResources()
      ).toEqual({
        cpus: 40,
        mem: 20,
        gpus: 0,
        disk: 0
      });
    });

    it("returns correct resource data for a single instance with executor resources", function() {
      expect(
        new Service({
          getSpec() {
            return {
              get(attribute) {
                return this[attribute];
              },
              getResources() {
                return {
                  cpus: 20,
                  mem: 10,
                  gpus: 0,
                  disk: 0
                };
              },
              executorResources: {
                cpus: 10,
                mem: 10,
                gpus: 0,
                disk: 0
              }
            };
          },
          getInstancesCount() {
            return 1;
          }
        }).getResources()
      ).toEqual({
        cpus: 30,
        mem: 20,
        gpus: 0,
        disk: 0
      });
    });

    it("returns correct resource data for multiple instances with executor resources", function() {
      expect(
        new Service({
          getSpec() {
            return {
              get(attribute) {
                return this[attribute];
              },
              getResources() {
                return {
                  cpus: 20,
                  mem: 10,
                  gpus: 0,
                  disk: 0
                };
              },
              executorResources: {
                cpus: 10,
                mem: 10,
                gpus: 0,
                disk: 0
              }
            };
          },
          getInstancesCount() {
            return 2;
          }
        }).getResources()
      ).toEqual({
        cpus: 60,
        mem: 40,
        gpus: 0,
        disk: 0
      });
    });
  });

  describe("#getRegions", function() {
    it("returns default correct regions data", function() {
      expect(
        new Service({
          tasks: [
            { region: "a" },
            { region: "b" },
            { region: "a" },
            { region: "a" },
            { region: "b" },
            {}
          ]
        }).getRegions()
      ).toEqual(["a", "b"]);
    });
    it("returns empty array for service without tasks", function() {
      expect(new Service({}).getRegions()).toEqual([]);
    });
  });

  describe("#getRunningInstancesCount", function() {
    it("returns the number of reported tasks", function() {
      const service = new Service({
        tasks: [{ foo: "bar" }, { bar: "baz" }]
      });

      expect(service.getRunningInstancesCount()).toEqual(2);
    });

    it("returns 0 when the tasks array is empty", function() {
      const service = new Service({
        tasks: []
      });

      expect(service.getRunningInstancesCount()).toEqual(0);
    });

    it("defaults to 0 if the tasks key is omitted", function() {
      const service = new Service({
        id: "/foo/bar"
      });

      expect(service.getRunningInstancesCount()).toEqual(0);
    });
  });

  describe("#toJSON", function() {
    it("returns a object with the values in _itemData", function() {
      const item = new Service({ foo: "bar", baz: "qux" });
      expect(item.toJSON()).toEqual({ foo: "bar", baz: "qux" });
    });

    it("returns a JSON string with the values in _itemData", function() {
      const item = new Service({ foo: "bar", baz: "qux" });
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });
  });
});
