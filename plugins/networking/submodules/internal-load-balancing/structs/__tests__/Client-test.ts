import Client from "../Client";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

let thisClientFixture, thisClient;

describe("Client", () => {
  beforeEach(() => {
    thisClientFixture = {
      machine_reachability: true,
      application_reachability: true,
      ip: "10.10.11.13",
      p99_latency_ms: 30,
      success_last_minute: 481,
      fail_last_minute: 3
    };

    thisClient = new Client(thisClientFixture);
  });

  describe("#getApplicationReachability", () => {
    it("returns a value of type boolean", () => {
      expect(typeof thisClient.getApplicationReachability()).toEqual("boolean");
    });

    it("returns the value it was given", () => {
      expect(thisClient.getApplicationReachability()).toEqual(
        thisClientFixture.application_reachability
      );
    });
  });

  describe("#getFailLastMinute", () => {
    it("returns a value of type number", () => {
      expect(typeof thisClient.getFailLastMinute()).toEqual("number");
    });

    it("returns the value it was given", () => {
      expect(thisClient.getFailLastMinute()).toEqual(
        thisClientFixture.fail_last_minute
      );
    });
  });

  describe("#getFailPercent", () => {
    it("returns a value of type number", () => {
      expect(typeof thisClient.getFailPercent()).toEqual("number");
    });

    it("returns an integer of the failures in the last minute", () => {
      expect(thisClient.getFailPercent()).toEqual(
        Math.floor(
          (thisClientFixture.fail_last_minute /
            thisClientFixture.success_last_minute) *
            100
        )
      );
    });

    it("returns 0 if there are no failures and no successes", () => {
      const clientWithNoCalls = new Client({
        ...thisClientFixture,
        success_last_minute: 0,
        fail_last_minute: 0
      });

      expect(clientWithNoCalls.getFailPercent()).toEqual(0);
    });

    it("returns 100 if there are no failures, but successes", () => {
      const clientWithNoFails = new Client({
        ...thisClientFixture,
        success_last_minute: 10,
        fail_last_minute: 0
      });

      expect(clientWithNoFails.getFailPercent()).toEqual(0);
    });

    it("returns 0 if there are no successes, but failures", () => {
      const clientWithNoSuccesses = new Client({
        ...thisClientFixture,
        success_last_minute: 0,
        fail_last_minute: 10
      });

      expect(clientWithNoSuccesses.getFailPercent()).toEqual(100);
    });
  });

  describe("#getIP", () => {
    it("returns the value it was given", () => {
      expect(thisClient.getIP()).toEqual(thisClientFixture.ip);
    });
  });

  describe("#getMachineReachability", () => {
    it("returns a value of type boolean", () => {
      expect(typeof thisClient.getMachineReachability()).toEqual("boolean");
    });

    it("returns the value it was given", () => {
      expect(thisClient.getMachineReachability()).toEqual(
        thisClientFixture.machine_reachability
      );
    });
  });

  describe("#getP99Latency", () => {
    it("returns a value of type number", () => {
      expect(typeof thisClient.getP99Latency()).toEqual("number");
    });

    it("returns the value it was given", () => {
      expect(thisClient.getP99Latency()).toEqual(
        thisClientFixture.p99_latency_ms
      );
    });
  });

  describe("#getSuccessLastMinute", () => {
    it("returns a value of type number", () => {
      expect(typeof thisClient.getSuccessLastMinute()).toEqual("number");
    });

    it("returns the value it was given", () => {
      expect(thisClient.getSuccessLastMinute()).toEqual(
        thisClientFixture.success_last_minute
      );
    });
  });
});
