const ServiceConfigUtil = require("../ServiceConfigUtil");

describe("ServiceConfigUtil", () => {
  describe("#matchVIPLabel", () => {
    it("returns true", () => {
      expect(ServiceConfigUtil.matchVIPLabel("VIP_1")).toBeTruthy();
    });

    it("returns false", () => {
      expect(ServiceConfigUtil.matchVIPLabel("LABEL")).toBeFalsy();
    });
  });

  describe("#findVIPLabel", () => {
    it("returns label", () => {
      expect(ServiceConfigUtil.findVIPLabel({ VIP_1: "" })).toEqual("VIP_1");
    });

    it("returns undefined", () => {
      expect(ServiceConfigUtil.findVIPLabel({ LABEL: "" })).toEqual(undefined);
    });
  });

  describe("#hasVIPLabel", () => {
    it("returns true", () => {
      expect(ServiceConfigUtil.hasVIPLabel({ VIP_1: "" })).toBeTruthy();
    });

    it("returns false", () => {
      expect(ServiceConfigUtil.hasVIPLabel({ LABEL: "" })).toBeFalsy();
    });
  });

  describe("#buildHostName", () => {
    it("adds a service address to the definition", () => {
      expect(ServiceConfigUtil.buildHostName("1234", 80)).toEqual(
        "1234.marathon.l4lb.thisdcos.directory:80"
      );
    });
  });

  describe("#buildHostNameFromVipLabel", () => {
    it("builds correct hostname", () => {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("/some-app:8080")
      ).toEqual("some-app.marathon.l4lb.thisdcos.directory:8080");
    });

    it("builds correct hostname for an IP address", () => {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("192.168.0.1:9091")
      ).toEqual("192.168.0.1:9091");
    });

    it("correctly displays <random port>", () => {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("192.168.0.1:0", undefined)
      ).toEqual("192.168.0.1:<assigned port>");
    });

    it("correctly uses desired port", () => {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("192.168.0.1:0", 9070)
      ).toEqual("192.168.0.1:9070");
    });
  });
});
