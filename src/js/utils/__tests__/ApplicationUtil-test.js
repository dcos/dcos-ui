const MockDate = require("mockdate");

const ApplicationUtil = require("../ApplicationUtil");
const Config = require("#SRC/js/config/Config").default;
const EventTypes = require("../../constants/EventTypes");
const MesosSummaryStore = require("../../stores/MesosSummaryStore");

describe("ApplicationUtil", function() {
  describe("#invokeAfterPageLoad", function() {
    beforeEach(function() {
      MockDate.set(new Date(2016, 3, 19));
    });

    afterEach(function() {
      MockDate.reset();
    });

    it("calls callback right away", function() {
      const handler = jasmine.createSpy("handler");
      const now = Date.now();

      global.getPageLoadedTime = function() {
        return now - Config.applicationRenderDelay;
      };

      ApplicationUtil.invokeAfterPageLoad(handler);

      jest.runAllTimers();
      expect(handler).toHaveBeenCalled();
    });

    it("calls after time has elapsed", function() {
      const handler = jasmine.createSpy("handler");
      const now = Date.now();

      global.getPageLoadedTime = function() {
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

  describe("#beginTemporaryPolling", function() {
    it("calls callback once event is emitted", function() {
      const handler = jasmine.createSpy("handler");
      ApplicationUtil.beginTemporaryPolling(handler);
      expect(handler).not.toBeCalled();
      MesosSummaryStore.emit(EventTypes.MESOS_SUMMARY_CHANGE);
      expect(handler).toBeCalled();
    });
  });
});
