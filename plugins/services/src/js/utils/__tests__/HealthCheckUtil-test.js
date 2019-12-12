import HealthCheckUtil from "../HealthCheckUtil";
import * as HealthCheckProtocols from "../../constants/HealthCheckProtocols";

describe("HealthCheckUtil", () => {
  describe("#IsKnowProtocol", () => {
    it("returns true for an empty string", () => {
      expect(HealthCheckUtil.isKnownProtocol("")).toEqual(true);
    });

    [
      HealthCheckProtocols.MESOS_HTTP,
      HealthCheckProtocols.MESOS_HTTPS,
      HealthCheckProtocols.COMMAND
    ].forEach(protocol => {
      it(`returns true for ${protocol}`, () => {
        expect(HealthCheckUtil.isKnownProtocol(protocol)).toEqual(true);
      });
    });

    [
      HealthCheckProtocols.HTTP,
      HealthCheckProtocols.HTTPS,
      HealthCheckProtocols.TCP
    ].forEach(protocol => {
      it(`returns false for deprecated ${protocol}`, () => {
        expect(HealthCheckUtil.isKnownProtocol(protocol)).toEqual(false);
      });
    });

    it("returns false for a unknown protocol", () => {
      expect(HealthCheckUtil.isKnownProtocol("MESOS_GOPHER")).toEqual(false);
    });
  });

  describe("#getMetadataText", () => {
    const protocolTrue = {
      tcp: true
    };
    const protocolFalse = {
      tcp: false
    };
    it("returns a string with the protocol and the port text", () => {
      expect(HealthCheckUtil.getMetadataText(protocolTrue, "80")).toBe(
        "(tcp/80)"
      );
    });
    it("returns a string with just the protocol if no port text is passed", () => {
      expect(HealthCheckUtil.getMetadataText(protocolTrue, "")).toBe("(tcp)");
    });
    it("returns a string with just the port text if no protocol is passed", () => {
      expect(HealthCheckUtil.getMetadataText(protocolFalse, "80")).toBe("(80)");
    });
    it("returns an empty string if neither the port text or the protocol are passed", () => {
      expect(HealthCheckUtil.getMetadataText(protocolFalse, "")).toBe("");
    });
  });

  describe("#getEndpointText", () => {
    it("returns a string with the hostPort value if one is defined", () => {
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

    it("returns a string with an environment variable placeholder if a port is automatically asigned", () => {
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
