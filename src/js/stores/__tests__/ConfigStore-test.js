const EventTypes = require("../../constants/EventTypes");
const ConfigStore = require("../ConfigStore");

let thisHandler;

describe("ConfigStore", function() {
  describe("#processCCIDSuccess", function() {
    beforeEach(function() {
      thisHandler = jest.genMockFunction();
      ConfigStore.once(EventTypes.CLUSTER_CCID_SUCCESS, thisHandler);
      ConfigStore.processCCIDSuccess({ foo: "bar" });
    });

    it("emits an event", function() {
      expect(thisHandler).toBeCalled();
    });

    it("returns stored info", function() {
      expect(ConfigStore.get("ccid")).toEqual({ foo: "bar" });
    });
  });
});
