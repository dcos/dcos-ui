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
    it("returns correct id", function() {
      const service = new Service({
        id: "/test/cmd"
      });

      expect(service.getMesosId()).toEqual("cmd.test");
    });
  });

  describe("#getResources", function() {
    it("should return default correct resource data", function() {
      expect(new Service().getResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      });
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
