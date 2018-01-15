const BaseStore = require("../BaseStore");

describe("BaseStore", function() {
  beforeEach(function() {
    this.instance = new BaseStore();
    this.instance.on = jasmine.createSpy("eventOn");
    this.instance.removeListener = jasmine.createSpy("eventRemoveListener");
  });

  describe("#addChangeListener", function() {
    it("has addChangeListener function", function() {
      expect(typeof this.instance.addChangeListener).toEqual("function");
    });

    it("calls on-function", function() {
      var handler = function() {};
      this.instance.addChangeListener("change", handler);
      expect(this.instance.on).toHaveBeenCalledWith("change", handler);
    });
  });

  describe("#removeChangeListener", function() {
    it("has removeChangeListener function", function() {
      expect(typeof this.instance.removeChangeListener).toEqual("function");
    });

    it("calls removeListener-function", function() {
      var handler = function() {};
      this.instance.removeChangeListener("change", handler);
      expect(this.instance.removeListener).toHaveBeenCalledWith(
        "change",
        handler
      );
    });
  });
});
