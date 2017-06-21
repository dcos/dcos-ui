jest.dontMock("../../constants/ActionTypes");
jest.dontMock("../AppDispatcher");
jest.dontMock("../../config/Config");
jest.dontMock("../MesosSummaryActions");
jest.dontMock("../../constants/TimeScales");

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
const Config = require("../../config/Config");
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
    it("fetches the most recent state by default", function() {
      MesosSummaryActions.fetchSummary();
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        "http://historyserver/dcos-history-service/history/last"
      );
    });

    it("fetches a whole minute when instructed", function() {
      MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        "http://historyserver/dcos-history-service/history/minute"
      );
    });

    it("fetches a whole hour when instructed", function() {
      MesosSummaryActions.fetchSummary(TimeScales.HOUR);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        "http://historyserver/dcos-history-service/history/hour"
      );
    });

    it("fetches a whole day when instructed", function() {
      MesosSummaryActions.fetchSummary(TimeScales.DAY);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toEqual(
        "http://historyserver/dcos-history-service/history/day"
      );
    });

    describe("When the history server is offline", function() {
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
});
