import Backend from "../Backend";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

let thisBackendFixture, thisBackend;

describe("Backend", () => {
  beforeEach(() => {
    thisBackendFixture = {
      ip: "10.10.11.12",
      port: 52342,
      machine_reachability_pct: 98,
      application_reachability_pct: 95,
      framework_id: "afe04867ec7a3845145579a95f72eca7",
      task_id: "b4b9b02e6f09a9bd760f388b67351e2b",
      p99_latency_ms: 30,
      success_last_minute: 481,
      fail_last_minute: 3
    };

    thisBackend = new Backend(thisBackendFixture);
  });

  describe("#getApplicationReachabilityPercent", () => {
    it("returns a value of type number", () => {
      expect(typeof thisBackend.getApplicationReachabilityPercent()).toEqual(
        "number"
      );
    });

    it("returns the value it was given", () => {
      expect(thisBackend.getApplicationReachabilityPercent()).toEqual(
        thisBackendFixture.application_reachability_pct
      );
    });
  });

  describe("#getFailLastMinute", () => {
    it("returns a value of type number", () => {
      expect(typeof thisBackend.getFailLastMinute()).toEqual("number");
    });

    it("returns the value it was given", () => {
      expect(thisBackend.getFailLastMinute()).toEqual(
        thisBackendFixture.fail_last_minute
      );
    });
  });

  describe("#getFailPercent", () => {
    it("returns a value of type number", () => {
      expect(typeof thisBackend.getFailPercent()).toEqual("number");
    });

    it("returns an integer of the failures in the last minute", () => {
      expect(thisBackend.getFailPercent()).toEqual(
        Math.floor(
          (thisBackendFixture.fail_last_minute /
            thisBackendFixture.success_last_minute) *
            100
        )
      );
    });

    it("returns 0 if there are no failures and no successes", () => {
      const backendWithNoCalls = new Backend({
        ...thisBackendFixture,
        success_last_minute: 0,
        fail_last_minute: 0
      });

      expect(backendWithNoCalls.getFailPercent()).toEqual(0);
    });

    it("returns 100 if there are no failures, but successes", () => {
      const backendWithNoFails = new Backend({
        ...thisBackendFixture,
        success_last_minute: 10,
        fail_last_minute: 0
      });

      expect(backendWithNoFails.getFailPercent()).toEqual(0);
    });

    it("returns 0 if there are no successes, but failures", () => {
      const backendWithNoSuccesses = new Backend({
        ...thisBackendFixture,
        success_last_minute: 0,
        fail_last_minute: 10
      });

      expect(backendWithNoSuccesses.getFailPercent()).toEqual(100);
    });
  });

  describe("#getFrameworkID", () => {
    it("returns the value it was given", () => {
      expect(thisBackend.getFrameworkID()).toEqual(
        thisBackendFixture.framework_id
      );
    });
  });

  describe("#getIP", () => {
    it("returns the value it was given", () => {
      expect(thisBackend.getIP()).toEqual(thisBackendFixture.ip);
    });
  });

  describe("#getMachineReachabilityPercent", () => {
    it("returns a value of type number", () => {
      expect(typeof thisBackend.getMachineReachabilityPercent()).toEqual(
        "number"
      );
    });

    it("returns the value it was given", () => {
      expect(thisBackend.getMachineReachabilityPercent()).toEqual(
        thisBackendFixture.machine_reachability_pct
      );
    });
  });

  describe("#getP99Latency", () => {
    it("returns a value of type number", () => {
      expect(typeof thisBackend.getP99Latency()).toEqual("number");
    });

    it("returns the value it was given", () => {
      expect(thisBackend.getP99Latency()).toEqual(
        thisBackendFixture.p99_latency_ms
      );
    });
  });

  describe("#getPort", () => {
    it("returns a value of type number", () => {
      expect(typeof thisBackend.getPort()).toEqual("number");
    });

    it("returns the value it was given", () => {
      expect(thisBackend.getPort()).toEqual(thisBackendFixture.port);
    });
  });

  describe("#getSuccessLastMinute", () => {
    it("returns a value of type number", () => {
      expect(typeof thisBackend.getSuccessLastMinute()).toEqual("number");
    });

    it("returns the value it was given", () => {
      expect(thisBackend.getSuccessLastMinute()).toEqual(
        thisBackendFixture.success_last_minute
      );
    });
  });

  describe("#getTaskID", () => {
    it("returns the value it was given", () => {
      expect(thisBackend.getTaskID()).toEqual(thisBackendFixture.task_id);
    });
  });
});
