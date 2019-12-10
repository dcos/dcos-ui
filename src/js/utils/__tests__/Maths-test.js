import Maths from "../Maths";

describe("Maths", () => {
  describe("#round", () => {
    it("rounds", () => {
      var value = Maths.round(1.9);
      expect(value).toEqual(2);
    });

    it("rounds on given precision", () => {
      var value = Maths.round(1.989, 2);
      expect(value).toEqual(1.99);
    });

    it("returns 0 with a non number", () => {
      var value = Maths.round(null);
      expect(value).toEqual(0);
    });

    it("leaves integers", () => {
      var value = Maths.round(123456, 4);
      expect(value).toEqual(123456);
    });
  });

  describe("#sum", () => {
    it("sums an array of numbers", () => {
      var total = Maths.sum([1, 2, 3, 4, 5, 6]);
      expect(total).toEqual(21);
    });

    it("sums nested arrays", () => {
      var total = Maths.sum([1, [2, 3], 4, [5], 6]);
      expect(total).toEqual(21);
    });

    it("sums deeply nested arrays", () => {
      var total = Maths.sum([1, [2, [3]], 4, [5], 6]);
      expect(total).toEqual(21);
    });
  });

  describe("#mean", () => {
    it("calculates the mean of an array", () => {
      var mean = Maths.mean([2, 2, 8]);
      expect(mean).toEqual(4);
    });
  });

  describe("#mapValue", () => {
    it("returns min if there is no range", () => {
      var value = Maths.mapValue(1, { min: 1, max: 1 });
      expect(value).toEqual(1);
    });

    it("returns undefined with a non number", () => {
      var value = Maths.mapValue(NaN, { min: 0, max: 10 });
      expect(typeof value).toEqual("undefined");
    });

    it("returns a number", () => {
      var value = Maths.mapValue(5, { min: 0, max: 10 });
      expect(typeof value).toEqual("number");
    });

    it("maps correctly", () => {
      var value = Maths.mapValue(5, { min: 0, max: 10 });
      expect(value).toEqual(0.5);
    });

    it("maps correctly", () => {
      var value = Maths.mapValue(2.5, { min: 0, max: 10 });
      expect(value).toEqual(0.25);
    });
  });

  describe("#unmapValue", () => {
    it("returns undefined with a non number", () => {
      var value = Maths.unmapValue(NaN, { min: 0, max: 10 });
      expect(typeof value).toEqual("undefined");
    });

    it("returns a number", () => {
      var value = Maths.unmapValue(0.5, { min: 0, max: 10 });
      expect(typeof value).toEqual("number");
    });

    it("maps correctly", () => {
      var value = Maths.unmapValue(0.5, { min: 0, max: 10 });
      expect(value).toEqual(5);
    });

    it("maps correctly", () => {
      var value = Maths.unmapValue(0.25, { min: 0, max: 10 });
      expect(value).toEqual(2.5);
    });
  });
});
