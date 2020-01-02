import AppDispatcher from "../AppDispatcher";
import MesosSummaryActions from "../MesosSummaryActions";
import TimeScales from "../../constants/TimeScales";

import { RequestUtil } from "mesosphere-shared-reactjs";
import Config from "#SRC/js/config/Config";

describe("Mesos State Actions", () => {
  beforeEach(() => {
    Config.historyServer = "http://historyserver";
    Config.rootUrl = "http://mesosserver";
    spyOn(RequestUtil, "json");
  });

  describe("#fetchSummary", () => {
    beforeEach(() => {
      spyOn(AppDispatcher, "handleServerAction");
      RequestUtil.json.and.callFake(req => {
        req.error({ message: "Guru Meditation" });
      });
    });

    afterEach(() => {
      // Clean up debouncing
      RequestUtil.json.and.callFake(req => {
        req.success();
      });
      MesosSummaryActions.fetchSummary();
    });

    it("falls back to the Mesos endpoint if the history service is offline on initial fetch", () => {
      MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toContain(
        "http://mesosserver/mesos/master/state-summary"
      );
    });

    it("falls back to the Mesos endpoint if the history service goes offline", () => {
      MesosSummaryActions.fetchSummary();
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.calls.mostRecent().args[0].url).toContain(
        "http://mesosserver/mesos/master/state-summary"
      );
    });
  });
});
