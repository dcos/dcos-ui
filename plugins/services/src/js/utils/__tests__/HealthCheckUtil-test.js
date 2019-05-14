import HealthCheckUtil from "../HealthCheckUtil";
import HealthCheckProtocols from "../../constants/HealthCheckProtocols";

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

  describe("#getMetadataText", function() {
    const protocolTrue = {
      tcp: true
    };
    const protocolFalse = {
      tcp: false
    };
    it("returns a string with the protocol and the port text", function() {
      expect(HealthCheckUtil.getMetadataText(protocolTrue, "80")).toBe(
        "(tcp/80)"
      );
    });
    it("returns a string with just the protocol if no port text is passed", function() {
      expect(HealthCheckUtil.getMetadataText(protocolTrue, "")).toBe("(tcp)");
    });
    it("returns a string with just the port text if no protocol is passed", function() {
      expect(HealthCheckUtil.getMetadataText(protocolFalse, "80")).toBe("(80)");
    });
    it("returns an empty string if neither the port text or the protocol are passed", function() {
      expect(HealthCheckUtil.getMetadataText(protocolFalse, "")).toBe("");
    });
  });

  describe("#getEndpointText", function() {
    it("returns a string with the hostPort value if one is defined", function() {
      const data = {
        portsAutoAssign: false,
        networks: [{ mode: "HOST" }]
      };

      const endpoint = {
        hostPort: "80",
        name: "endpointone",
        protocol: {
          tcp: true
        }
      };

      expect(HealthCheckUtil.getEndpointText(0, endpoint, data)).toContain(
        "80"
      );
    });

    it("returns a string with an environment variable placeholder if a port is automatically asigned", function() {
      const data = {
        portsAutoAssign: true,
        networks: [{ mode: "HOST" }]
      };

      const endpoint = {
        name: "endpointone",
        protocol: {
          tcp: true
        }
      };

      expect(HealthCheckUtil.getEndpointText(0, endpoint, data)).toContain(
        "$PORT"
      );
    });
  });
});
