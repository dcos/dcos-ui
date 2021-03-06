import ConfigStore from "../ConfigStore";

import * as EventTypes from "../../constants/EventTypes";

let thisHandler;

describe("ConfigStore", () => {
  describe("#processCCIDSuccess", () => {
    beforeEach(() => {
      thisHandler = jest.fn();
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
