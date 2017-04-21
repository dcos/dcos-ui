jest.dontMock("../ServiceConfigUtil");

const ServiceConfigUtil = require("../ServiceConfigUtil");

describe("ServiceConfigUtil", function() {
  describe("#matchVIPLabel", function() {
    it("returns true", function() {
      expect(ServiceConfigUtil.matchVIPLabel("VIP_1")).toBeTruthy();
    });

    it("returns false", function() {
      expect(ServiceConfigUtil.matchVIPLabel("LABEL")).toBeFalsy();
    });
  });

  describe("#findVIPLabel", function() {
    it("returns label", function() {
      expect(ServiceConfigUtil.findVIPLabel({ VIP_1: "" })).toEqual("VIP_1");
    });

    it("returns undefined", function() {
      expect(ServiceConfigUtil.findVIPLabel({ LABEL: "" })).toEqual(undefined);
    });
  });

  describe("#hasVIPLabel", function() {
    it("returns true", function() {
      expect(ServiceConfigUtil.hasVIPLabel({ VIP_1: "" })).toBeTruthy();
    });

    it("returns false", function() {
      expect(ServiceConfigUtil.hasVIPLabel({ LABEL: "" })).toBeFalsy();
    });
  });

  describe("#buildHostName", function() {
    it("adds a service address to the definition", function() {
      expect(ServiceConfigUtil.buildHostName("1234", 80)).toEqual(
        "1234.marathon.l4lb.thisdcos.directory:80"
      );
    });
  });

  describe("#buildHostNameFromVipLabel", function() {
    it("builds correct hostname", function() {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("/some-app:8080")
      ).toEqual("some-app.marathon.l4lb.thisdcos.directory:8080");
    });

    it("builds correct hostname for an IP address", function() {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("192.168.0.1:9091")
      ).toEqual("192.168.0.1:9091");
    });

    it("correctly displays <random port>", function() {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("192.168.0.1:0", undefined)
      ).toEqual("192.168.0.1:<assigned port>");
    });

    it("correctly uses desired port", function() {
      expect(
        ServiceConfigUtil.buildHostNameFromVipLabel("192.168.0.1:0", 9070)
      ).toEqual("192.168.0.1:9070");
    });
  });
});
