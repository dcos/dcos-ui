import { compareString, ComparisonResult } from "../";

const idLense = (x: string) => x;

describe("comparString", () => {
  it("compares strings", () => {
    expect(compareString(idLense)("a", "b")).toBe(ComparisonResult.LESS_THAN);
    expect(compareString(idLense)("b", "a")).toBe(
      ComparisonResult.GREATER_THAN
    );
    expect(compareString(idLense)("b", "b")).toBe(ComparisonResult.EQUAL);
  });

  it("executes the lense before comparing", () => {
    const mockLense = jest.fn().mockReturnValue("42");
    const comparator = compareString(mockLense);
    expect(mockLense).not.toHaveBeenCalled();

    comparator("10", "100");
    expect(mockLense).toHaveBeenCalledTimes(2);
  });
});
