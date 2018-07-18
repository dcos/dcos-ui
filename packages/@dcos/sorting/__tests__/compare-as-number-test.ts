import { compareNumber, ComparisonResult } from "../";

const idLense = (x: any) => x;

describe("compareNumber", () => {
  it("compares number", () => {
    expect(compareNumber(idLense)(5, 8)).toBe(ComparisonResult.SMALLER_THAN);
    expect(compareNumber(idLense)(8, 5)).toBe(ComparisonResult.GREATER_THAN);
    expect(compareNumber(idLense)(5, 5)).toBe(ComparisonResult.EQUAL);
  });

  it("executes the lense before comparing", () => {
    const mockLense = jest.fn();
    const comparator = compareNumber(mockLense);
    expect(mockLense).not.toHaveBeenCalled();

    comparator(10, 100);
    expect(mockLense).toHaveBeenCalledTimes(2);
  });
});
