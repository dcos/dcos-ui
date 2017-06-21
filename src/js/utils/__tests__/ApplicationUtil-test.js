jest.dontMock("../../stores/MesosSummaryStore");

const ApplicationUtil = require("../ApplicationUtil");
const Config = require("../../config/Config");
const EventTypes = require("../../constants/EventTypes");
const MesosSummaryStore = require("../../stores/MesosSummaryStore");

describe("ApplicationUtil", function() {
  describe("#invokeAfterPageLoad", function() {
    beforeEach(function() {
      // Clean up application timers.
      jasmine.clock().uninstall();
      // Install our custom jasmine timers.
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2016, 3, 19));
    });

    afterEach(function() {
      // Clean up application timers.
      jasmine.clock().uninstall();
    });

    it("should call callback right away", function() {
      const handler = jasmine.createSpy("handler");
      const now = Date.now();

      global.getPageLoadedTime = function() {
        return now - Config.applicationRenderDelay;
      };

      ApplicationUtil.invokeAfterPageLoad(handler);

      jasmine.clock().tick();
      expect(handler).toHaveBeenCalled();
    });

    it("should call after time has elapsed", function() {
      const handler = jasmine.createSpy("handler");
      const now = Date.now();

      global.getPageLoadedTime = function() {
        return now;
      };

      ApplicationUtil.invokeAfterPageLoad(handler);

      // Ensure that it's not called before the time has elapsed, tick the
      // timers and then check if it was called
      expect(handler).not.toHaveBeenCalled();
      jasmine.clock().tick(Config.applicationRenderDelay);
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
