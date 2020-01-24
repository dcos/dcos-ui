import { isRegionConstraint, isZoneConstraint } from "../PlacementUtil";

describe("#PlacementUtil", () => {
  describe("#isRegionConstraint", () => {
    it("returns true for a region constraint", () => {
      expect(isRegionConstraint("@region", "IS")).toBe(true);
    });

    it("returns false for a region other operator", () => {
      expect(isRegionConstraint("@region", "LIKE")).toBe(false);
    });

    it("returns false for another field", () => {
      expect(isRegionConstraint("random", "IS")).toBe(false);
    });
  });

  describe("#isZoneConstraint", () => {
    it("returns true for a zone constraint", () => {
      expect(isZoneConstraint("@zone", "GROUP_BY")).toBe(true);
    });

    it("returns false for a zone other operator", () => {
      expect(isZoneConstraint("@zone", "LIKE")).toBe(false);
    });

    it("returns false for another field", () => {
      expect(isZoneConstraint("random", "IS")).toBe(false);
    });
  });
});
