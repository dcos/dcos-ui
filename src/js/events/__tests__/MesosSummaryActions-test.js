const Hooks = require("PluginSDK").Hooks;

jest.setMock("react-router", {
  hashHistory: {
    location: { pathname: "/foo" },
    listen() {}
  }
});

const PluginTestUtils = require("PluginTestUtils");
const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

PluginTestUtils.loadPluginsByName({
  tracking: { enabled: true }
});

const AppDispatcher = require("../AppDispatcher");
const Config = require("#SRC/js/config/Config").default;
const MesosSummaryActions = require("../MesosSummaryActions");
const TimeScales = require("../../constants/TimeScales");

global.analytics = {
  initialized: true,
  track() {},
  log() {}
};

Hooks.addFilter("hasCapability", function() {
  return true;
});

describe("Mesos State Actions", function() {
  beforeEach(function() {
    Config.historyServer = "http://historyserver";
    Config.rootUrl = "http://mesosserver";
    spyOn(RequestUtil, "json");
  });

  describe("#fetchSummary", function() {
    beforeEach(function() {
      spyOn(AppDispatcher, "handleServerAction");
      RequestUtil.json.and.callFake(function(req) {
        req.error({ message: "Guru Meditation" });
      });
    });

    afterEach(function() {
      // Clean up debouncing
      RequestUtil.json.and.callFake(function(req) {
        req.success();
      });
      MesosSummaryActions.fetchSummary();
    });

    it("falls back to the Mesos endpoint if the history service is offline on initial fetch", function() {
      MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toContain(
        "http://mesosserver/mesos/master/state-summary"
      );
    });

    it("falls back to the Mesos endpoint if the history service goes offline", function() {
      MesosSummaryActions.fetchSummary();
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toContain(
        "http://mesosserver/mesos/master/state-summary"
      );
    });
  });
});
