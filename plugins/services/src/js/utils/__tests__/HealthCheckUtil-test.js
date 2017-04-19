const HealthCheckUtil = require("../HealthCheckUtil");
const HealthCheckProtocols = require("../../constants/HealthCheckProtocols");

describe("HealthCheckUtil", function() {
  describe("#IsKnowProtocol", function() {
    it("should return true for an empty string", function() {
      expect(HealthCheckUtil.isKnownProtocol("")).toEqual(true);
    });

    [
      HealthCheckProtocols.MESOS_HTTP,
      HealthCheckProtocols.MESOS_HTTPS,
      HealthCheckProtocols.COMMAND
    ].forEach(protocol => {
      it(`should return true for ${protocol}`, function() {
        expect(HealthCheckUtil.isKnownProtocol(protocol)).toEqual(true);
      });
    });

    [
      HealthCheckProtocols.HTTP,
      HealthCheckProtocols.HTTPS,
      HealthCheckProtocols.TCP
    ].forEach(protocol => {
      it(`should return false for deprecated ${protocol}`, function() {
        expect(HealthCheckUtil.isKnownProtocol(protocol)).toEqual(false);
      });
    });

    it("should return false for a unknown protocol", function() {
      expect(HealthCheckUtil.isKnownProtocol("MESOS_GOPHER")).toEqual(false);
    });
  });
});
