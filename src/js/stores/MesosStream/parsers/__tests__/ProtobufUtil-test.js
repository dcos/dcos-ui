import * as ProtobufUtil from "../ProtobufUtil";

describe("ProtobufUtil", function() {
  describe("#isScalar", function() {
    describe("when value is valid scalar", function() {
      it("returns true", function() {
        expect(ProtobufUtil.isScalar({ value: 1 })).toBe(true);
      });
    });

    describe("when value is not valid scalar", function() {
      it("returns false for a string", function() {
        expect(ProtobufUtil.isScalar("string")).toBe(false);
      });

      it("returns false for NaN", function() {
        expect(ProtobufUtil.isScalar(NaN)).toBe(false);
      });

      it("returns false for a Number", function() {
        expect(ProtobufUtil.isScalar(100)).toBe(false);
      });

      it("returns false for Boolean", function() {
        expect(ProtobufUtil.isScalar(true)).toBe(false);
      });

      it("returns false for null", function() {
        expect(ProtobufUtil.isScalar(null)).toBe(false);
      });

      it("returns false for a non scalar object", function() {
        expect(ProtobufUtil.isScalar({ key: 1 })).toBe(false);
      });

      it("returns false for an array", function() {
        expect(ProtobufUtil.isScalar([])).toBe(false);
      });
    });
  });

  describe("#scalar", function() {
    it("returns scalar value", function() {
      expect(ProtobufUtil.scalar({ value: 1 })).toBe(1);
    });

    it("throws recieving a non scalar value", function() {
      expect(() => ProtobufUtil.scalar(undefined)).toThrow();
    });
  });
});
