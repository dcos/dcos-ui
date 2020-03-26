import { isHostNetwork, getHostPortPlaceholder } from "../NetworkUtil";

describe("NetworkUtil", () => {
  describe("#isHostNetwork", () => {
    it("returns true if the network type is HOST", () => {
      expect(
        isHostNetwork({
          networks: [{ mode: "HOST" }],
        })
      ).toBe(true);
    });
    it("returns true if there are no networks", () => {
      expect(
        isHostNetwork({
          networks: [],
        })
      ).toBe(true);
    });
    it("returns false if the network type is not HOST", () => {
      expect(
        isHostNetwork({
          networks: [{ mode: "BRIDGE" }],
        })
      ).toBe(false);
    });
  });

  describe("#getHostPortPlaceholder", () => {
    it("returns a string with $ENDPOINT_ if the endpoint is on a pod", () => {
      expect(getHostPortPlaceholder("portone", true)).toBe("$ENDPOINT_PORTONE");
    });
    it("returns a string with $PORT if the endpoint is on an app", () => {
      expect(getHostPortPlaceholder("0", false)).toBe("$PORT0");
    });
  });
});
