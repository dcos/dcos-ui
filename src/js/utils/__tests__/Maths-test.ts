import Maths from "../Maths";

describe("Maths", () => {
  describe("#round", () => {
    it("rounds", () => {
      const value = Maths.round(1.9);
      expect(value).toEqual(2);
    });

    it("rounds on given precision", () => {
      const value = Maths.round(1.989, 2);
      expect(value).toEqual(1.99);
    });

    it("returns 0 with a non number", () => {
      const value = Maths.round(null);
      expect(value).toEqual(0);
    });

    it("leaves integers", () => {
      const value = Maths.round(123456, 4);
      expect(value).toEqual(123456);
    });
  });

  describe("#sum", () => {
    it("sums an array of numbers", () => {
      const total = Maths.sum([1, 2, 3, 4, 5, 6]);
      expect(total).toEqual(21);
    });

    it("sums nested arrays", () => {
      const total = Maths.sum([1, [2, 3], 4, [5], 6]);
      expect(total).toEqual(21);
    });

    it("sums deeply nested arrays", () => {
      const total = Maths.sum([1, [2, [3]], 4, [5], 6]);
      expect(total).toEqual(21);
    });
  });

  describe("#mean", () => {
    it("calculates the mean of an array", () => {
      const mean = Maths.mean([2, 2, 8]);
      expect(mean).toEqual(4);
    });
  });

  describe("#mapValue", () => {
    it("returns min if there is no range", () => {
      const value = Maths.mapValue(1, { min: 1, max: 1 });
      expect(value).toEqual(1);
    });

    it("returns undefined with a non number", () => {
      const value = Maths.mapValue(NaN, { min: 0, max: 10 });
      expect(typeof value).toEqual("undefined");
    });

    it("returns a number", () => {
      const value = Maths.mapValue(5, { min: 0, max: 10 });
      expect(typeof value).toEqual("number");
    });

    it("maps correctly", () => {
      const value = Maths.mapValue(5, { min: 0, max: 10 });
      expect(value).toEqual(0.5);
    });

    it("maps correctly", () => {
      const value = Maths.mapValue(2.5, { min: 0, max: 10 });
      expect(value).toEqual(0.25);
    });
  });

  describe("#unmapValue", () => {
    it("returns undefined with a non number", () => {
      const value = Maths.unmapValue(NaN, { min: 0, max: 10 });
      expect(typeof value).toEqual("undefined");
    });

    it("returns a number", () => {
      const value = Maths.unmapValue(0.5, { min: 0, max: 10 });
      expect(typeof value).toEqual("number");
    });

    it("maps correctly", () => {
      const value = Maths.unmapValue(0.5, { min: 0, max: 10 });
      expect(value).toEqual(5);
    });

    it("maps correctly", () => {
      const value = Maths.unmapValue(0.25, { min: 0, max: 10 });
      expect(value).toEqual(2.5);
    });
  });
});
