import VIPSummary from "../VIPSummary";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

let thisVipSummaryFixture, thisVipSummary;

describe("VIPSummary", () => {
  beforeEach(() => {
    thisVipSummaryFixture = {
      vip: {
        port: "foo",
        ip: "bar",
        protocol: "baz"
      },
      success_last_minute: "500",
      fail_last_minute: "400",
      application_reachability_pct: "300",
      machine_reachability_pct: "200",
      p99_latency_ms: "100"
    };

    thisVipSummary = new VIPSummary(thisVipSummaryFixture);
  });

  describe("#getApplicationReachabilityPercent", () => {
    it("returns a value of type number", () => {
      expect(typeof thisVipSummary.getApplicationReachabilityPercent()).toEqual(
        "number"
      );
    });

    it(
      "returns an integer of the application reachability percentage in the " +
        "last minute",
      () => {
        expect(thisVipSummary.getApplicationReachabilityPercent()).toEqual(
          Number(thisVipSummaryFixture.application_reachability_pct)
        );
      }
    );

    it("returns 0 when the datum is undefined", () => {
      expect(new VIPSummary({}).getApplicationReachabilityPercent()).toEqual(0);
    });
  });

  describe("#getFailLastMinute", () => {
    it("returns a value of type number", () => {
      expect(typeof thisVipSummary.getFailLastMinute()).toEqual("number");
    });

    it("returns an integer of the failures in the last minute", () => {
      expect(thisVipSummary.getFailLastMinute()).toEqual(
        Number(thisVipSummaryFixture.fail_last_minute)
      );
    });

    it("returns 0 when the datum is undefined", () => {
      expect(new VIPSummary({}).getFailLastMinute()).toEqual(0);
    });
  });

  describe("#getFailPercent", () => {
    it("returns a value of type number", () => {
      expect(typeof thisVipSummary.getFailPercent()).toEqual("number");
    });

    it("returns an integer of the failures in the last minute", () => {
      expect(thisVipSummary.getFailPercent()).toEqual(44.4444);
    });

    it("returns no decimal places when the value is a whole number", () => {
      const vipSummary = new VIPSummary({
        vip: {
          port: "foo",
          ip: "bar",
          protocol: "baz"
        },
        success_last_minute: "0",
        fail_last_minute: "400",
        application_reachability_pct: "0",
        machine_reachability_pct: "0",
        p99_latency_ms: "0"
      });

      expect(String(vipSummary.getFailPercent())).toEqual("100");
    });

    it("returns no decimal places when the value is a whole number", () => {
      const vipSummary = new VIPSummary({
        vip: {
          port: "foo",
          ip: "bar",
          protocol: "baz"
        },
        success_last_minute: "199",
        fail_last_minute: "1",
        application_reachability_pct: "0",
        machine_reachability_pct: "0",
        p99_latency_ms: "0"
      });

      expect(String(vipSummary.getFailPercent())).toEqual("0.5");
    });

    it("rounds to the nearest fourth decimal place", () => {
      const vipSummary = new VIPSummary({
        vip: {
          port: "foo",
          ip: "bar",
          protocol: "baz"
        },
        success_last_minute: "1",
        fail_last_minute: "2",
        application_reachability_pct: "0",
        machine_reachability_pct: "0",
        p99_latency_ms: "0"
      });

      expect(String(vipSummary.getFailPercent())).toEqual("66.6667");
    });

    it("returns 0 if there are no failures and no successes", () => {
      const vipSummaryWithNoCalls = new VIPSummary({
        ...thisVipSummaryFixture,
        success_last_minute: 0,
        fail_last_minute: 0
      });

      expect(vipSummaryWithNoCalls.getFailPercent()).toEqual(0);
    });

    it("returns 100 if there are no failures, but successes", () => {
      const vipSummaryWithNoFails = new VIPSummary({
        ...thisVipSummaryFixture,
        success_last_minute: 10,
        fail_last_minute: 0
      });

      expect(vipSummaryWithNoFails.getFailPercent()).toEqual(0);
    });

    it("returns 0 if there are no successes, but failures", () => {
      const vipSummaryWithNoSuccesses = new VIPSummary({
        ...thisVipSummaryFixture,
        success_last_minute: 0,
        fail_last_minute: 10
      });

      expect(vipSummaryWithNoSuccesses.getFailPercent()).toEqual(100);
    });
  });

  describe("#getMachineReachabilityPercent", () => {
    it("returns a value of type number", () => {
      expect(typeof thisVipSummary.getMachineReachabilityPercent()).toEqual(
        "number"
      );
    });

    it(
      "returns an integer of the application reachability percentage in " +
        "the last minute",
      () => {
        expect(thisVipSummary.getMachineReachabilityPercent()).toEqual(
          Number(thisVipSummaryFixture.machine_reachability_pct)
        );
      }
    );

    it("returns 0 when the datum is undefined", () => {
      expect(new VIPSummary({}).getMachineReachabilityPercent()).toEqual(0);
    });
  });

  describe("#getName", () => {
    it("returns the name defined on the vip key", () => {
      const vipSummary = new VIPSummary({
        vip: {
          port: "foo",
          ip: "bar",
          protocol: "baz",
          name: "qux"
        },
        success_last_minute: "0",
        fail_last_minute: "400",
        application_reachability_pct: "0",
        machine_reachability_pct: "0",
        p99_latency_ms: "0"
      });

      expect(new VIPSummary(vipSummary).getName()).toEqual("qux");
    });

    it("defaults to the vip string if name is undefined", () => {
      const vipSummary = new VIPSummary({
        vip: {
          port: "foo",
          ip: "bar",
          protocol: "baz"
        },
        success_last_minute: "0",
        fail_last_minute: "400",
        application_reachability_pct: "0",
        machine_reachability_pct: "0",
        p99_latency_ms: "0"
      });

      expect(new VIPSummary(vipSummary).getName()).toEqual("bar:foo");
    });
  });

  describe("#getP99Latency", () => {
    it("returns a value of type number", () => {
      expect(typeof thisVipSummary.getP99Latency()).toEqual("number");
    });

    it(
      "returns an integer of the application reachability percentage in the " +
        "last minute",
      () => {
        expect(thisVipSummary.getP99Latency()).toEqual(
          Number(thisVipSummaryFixture.p99_latency_ms)
        );
      }
    );

    it("returns 0 when the datum is undefined", () => {
      expect(new VIPSummary({}).getP99Latency()).toEqual(0);
    });
  });

  describe("#getSuccessLastMinute", () => {
    it("returns a value of type number", () => {
      expect(typeof thisVipSummary.getSuccessLastMinute()).toEqual("number");
    });

    it("returns an integer of the successes in the last minute", () => {
      expect(thisVipSummary.getSuccessLastMinute()).toEqual(
        Number(thisVipSummaryFixture.success_last_minute)
      );
    });

    it("returns 0 when the datum is undefined", () => {
      expect(new VIPSummary({}).getSuccessLastMinute()).toEqual(0);
    });
  });

  describe("#getVIPString", () => {
    it("returns a concatenated string with IP and port", () => {
      expect(thisVipSummary.getVIPString()).toEqual(
        thisVipSummaryFixture.vip.ip + ":" + thisVipSummaryFixture.vip.port
      );
    });
  });
});
