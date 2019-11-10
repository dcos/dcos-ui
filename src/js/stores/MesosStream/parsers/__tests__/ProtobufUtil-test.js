import * as ProtobufUtil from "../ProtobufUtil";

describe("ProtobufUtil", () => {
  describe("#isScalar", () => {
    describe("when value is valid scalar", () => {
      it("returns true", () => {
        expect(ProtobufUtil.isScalar({ value: 1 })).toBe(true);
      });
    });

    describe("when value is not valid scalar", () => {
      it("returns false for a string", () => {
        expect(ProtobufUtil.isScalar("string")).toBe(false);
      });

      it("returns false for NaN", () => {
        expect(ProtobufUtil.isScalar(NaN)).toBe(false);
      });

      it("returns false for a Number", () => {
        expect(ProtobufUtil.isScalar(100)).toBe(false);
      });

      it("returns false for Boolean", () => {
        expect(ProtobufUtil.isScalar(true)).toBe(false);
      });

      it("returns false for null", () => {
        expect(ProtobufUtil.isScalar(null)).toBe(false);
      });

      it("returns false for a non scalar object", () => {
        expect(ProtobufUtil.isScalar({ key: 1 })).toBe(false);
      });

      it("returns false for an array", () => {
        expect(ProtobufUtil.isScalar([])).toBe(false);
      });
    });
  });

  describe("#scalar", () => {
    it("returns scalar value", () => {
      expect(ProtobufUtil.scalar({ value: 1 })).toBe(1);
    });

    it("throws recieving a non scalar value", () => {
      expect(() => ProtobufUtil.scalar(undefined)).toThrow();
    });
  });
});
