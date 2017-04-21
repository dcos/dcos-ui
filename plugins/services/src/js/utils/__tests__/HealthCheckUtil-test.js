const HealthCheckUtil = require("../HealthCheckUtil");
const HealthCheckProtocols = require("../../constants/HealthCheckProtocols");

describe("HealthCheckUtil", function() {
  describe("#IsKnowProtocol", function() {
    it("should return true for an empty string", function() {
      expect(HealthCheckUtil.isKnownProtocol("")).toEqual(true);
    });

    Object.values(HealthCheckProtocols).forEach(protocol => {
      it(`should return true for ${protocol}`, function() {
        expect(HealthCheckUtil.isKnownProtocol(protocol)).toEqual(true);
      });
    });

    it("should return false for a unknown protocol", function() {
      expect(HealthCheckUtil.isKnownProtocol("MESOS_GOPHER")).toEqual(false);
    });
  });
});
