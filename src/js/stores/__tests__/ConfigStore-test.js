import ConfigStore from "../ConfigStore";

const EventTypes = require("../../constants/EventTypes");

let thisHandler;

describe("ConfigStore", () => {
  describe("#processCCIDSuccess", () => {
    beforeEach(() => {
      thisHandler = jest.genMockFunction();
      ConfigStore.once(EventTypes.CLUSTER_CCID_SUCCESS, thisHandler);
      ConfigStore.processCCIDSuccess({ foo: "bar" });
    });

    it("emits an event", () => {
      expect(thisHandler).toBeCalled();
    });

    it("returns stored info", () => {
      expect(ConfigStore.get("ccid")).toEqual({ foo: "bar" });
    });
  });
});
