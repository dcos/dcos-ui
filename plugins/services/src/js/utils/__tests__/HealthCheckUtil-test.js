const HealthCheckUtil = require("../HealthCheckUtil");
const HealthCheckProtocols = require("../../constants/HealthCheckProtocols");

describe("HealthCheckUtil", function() {
  describe("#IsKnowProtocol", function() {
    it("returns true for an empty string", function() {
      expect(HealthCheckUtil.isKnownProtocol("")).toEqual(true);
    });

    [
      HealthCheckProtocols.MESOS_HTTP,
      HealthCheckProtocols.MESOS_HTTPS,
      HealthCheckProtocols.COMMAND
    ].forEach(protocol => {
      it(`returns true for ${protocol}`, function() {
        expect(HealthCheckUtil.isKnownProtocol(protocol)).toEqual(true);
      });
    });

    [
      HealthCheckProtocols.HTTP,
      HealthCheckProtocols.HTTPS,
      HealthCheckProtocols.TCP
    ].forEach(protocol => {
      it(`returns false for deprecated ${protocol}`, function() {
        expect(HealthCheckUtil.isKnownProtocol(protocol)).toEqual(false);
      });
    });

    it("returns false for a unknown protocol", function() {
      expect(HealthCheckUtil.isKnownProtocol("MESOS_GOPHER")).toEqual(false);
    });
  });
});
