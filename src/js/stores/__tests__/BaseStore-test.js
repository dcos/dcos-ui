import BaseStore from "../BaseStore";

let thisInstance;

describe("BaseStore", () => {
  beforeEach(() => {
    thisInstance = new BaseStore();
    thisInstance.on = jasmine.createSpy("eventOn");
    thisInstance.removeListener = jasmine.createSpy("eventRemoveListener");
  });

  describe("#addChangeListener", () => {
    it("has addChangeListener function", () => {
      expect(typeof thisInstance.addChangeListener).toEqual("function");
    });

    it("calls on-function", () => {
      const handler = () => {};
      thisInstance.addChangeListener("change", handler);
      expect(thisInstance.on).toHaveBeenCalledWith("change", handler);
    });
  });

  describe("#removeChangeListener", () => {
    it("has removeChangeListener function", () => {
      expect(typeof thisInstance.removeChangeListener).toEqual("function");
    });

    it("calls removeListener-function", () => {
      const handler = () => {};
      thisInstance.removeChangeListener("change", handler);
      expect(thisInstance.removeListener).toHaveBeenCalledWith(
        "change",
        handler
      );
    });
  });
});
