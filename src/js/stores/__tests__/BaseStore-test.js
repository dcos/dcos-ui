const BaseStore = require("../BaseStore");

let thisInstance;

describe("BaseStore", function() {
  beforeEach(function() {
    thisInstance = new BaseStore();
    thisInstance.on = jasmine.createSpy("eventOn");
    thisInstance.removeListener = jasmine.createSpy("eventRemoveListener");
  });

  describe("#addChangeListener", function() {
    it("has addChangeListener function", function() {
      expect(typeof thisInstance.addChangeListener).toEqual("function");
    });

    it("calls on-function", function() {
      var handler = function() {};
      thisInstance.addChangeListener("change", handler);
      expect(thisInstance.on).toHaveBeenCalledWith("change", handler);
    });
  });

  describe("#removeChangeListener", function() {
    it("has removeChangeListener function", function() {
      expect(typeof thisInstance.removeChangeListener).toEqual("function");
    });

    it("calls removeListener-function", function() {
      var handler = function() {};
      thisInstance.removeChangeListener("change", handler);
      expect(thisInstance.removeListener).toHaveBeenCalledWith(
        "change",
        handler
      );
    });
  });
});
