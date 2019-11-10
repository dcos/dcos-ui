const ApplicationUtil = require("../ApplicationUtil");
const Config = require("#SRC/js/config/Config").default;
const EventTypes = require("../../constants/EventTypes");
const MesosSummaryStore = require("../../stores/MesosSummaryStore");

describe("ApplicationUtil", () => {
  describe("#invokeAfterPageLoad", () => {
    it("calls callback right away", () => {
      const handler = jasmine.createSpy("handler");
      const now = Date.now();

      global.getPageLoadedTime = () => {
        return now - Config.applicationRenderDelay;
      };

      ApplicationUtil.invokeAfterPageLoad(handler);

      jest.runAllTimers();
      expect(handler).toHaveBeenCalled();
    });

    it("calls after time has elapsed", () => {
      const handler = jasmine.createSpy("handler");
      const now = Date.now();

      global.getPageLoadedTime = () => {
        return now;
      };

      ApplicationUtil.invokeAfterPageLoad(handler);

      // Ensure that it's not called before the time has elapsed, tick the
      // timers and then check if it was called
      expect(handler).not.toHaveBeenCalled();
      jest.advanceTimersByTime(Config.applicationRenderDelay);
      expect(handler).toHaveBeenCalled();
    });
  });

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
