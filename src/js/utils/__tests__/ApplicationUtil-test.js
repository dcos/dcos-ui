import ApplicationUtil from "../ApplicationUtil";
import MesosSummaryStore from "../../stores/MesosSummaryStore";

const EventTypes = require("../../constants/EventTypes");

describe("ApplicationUtil", () => {
  describe("#beginTemporaryPolling", () => {
    it("calls callback once event is emitted", () => {
      const handler = jasmine.createSpy("handler");
      ApplicationUtil.beginTemporaryPolling(handler);
      expect(handler).not.toBeCalled();
      MesosSummaryStore.emit(EventTypes.MESOS_SUMMARY_CHANGE);
      expect(handler).toBeCalled();
    });
  });
});
