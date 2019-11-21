const ApplicationUtil = require("../ApplicationUtil");
const EventTypes = require("../../constants/EventTypes");
const MesosSummaryStore = require("../../stores/MesosSummaryStore");

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
