const EventTypes = require("../../constants/EventTypes");
const ConfigStore = require("../ConfigStore");

describe("ConfigStore", function() {
  describe("#processCCIDSuccess", function() {
    beforeEach(function() {
      this.handler = jest.genMockFunction();
      ConfigStore.once(EventTypes.CLUSTER_CCID_SUCCESS, this.handler);
      ConfigStore.processCCIDSuccess({ foo: "bar" });
    });

    it("emits an event", function() {
      expect(this.handler).toBeCalled();
    });

    it("returns stored info", function() {
      expect(ConfigStore.get("ccid")).toEqual({ foo: "bar" });
    });
  });
});
