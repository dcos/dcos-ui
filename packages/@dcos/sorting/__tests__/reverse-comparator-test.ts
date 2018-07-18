import { reverseComparator, ComparisonResult } from "../";

describe("reverseComparator", () => {
  it("calls the wrapped comparator with the same values", () => {
    const comparator = jest.fn();
    const reversedComparator = reverseComparator(comparator);

    expect(comparator).not.toHaveBeenCalled();
    reversedComparator(3, 1);
    expect(comparator).toHaveBeenCalledWith(3, 1);
  });

  it("returns the opposite from the wrapped comparator", () => {
    const positiveComparator = jest
      .fn()
      .mockReturnValue(ComparisonResult.GREATER_THAN);
    const neutralComparator = jest.fn().mockReturnValue(ComparisonResult.EQUAL);
    const negativeComparator = jest
      .fn()
      .mockReturnValue(ComparisonResult.SMALLER_THAN);

    expect(reverseComparator(positiveComparator)(1, 2)).toEqual(
      ComparisonResult.SMALLER_THAN
    );
    expect(reverseComparator(neutralComparator)(1, 2)).toEqual(
      ComparisonResult.EQUAL
    );
    expect(reverseComparator(negativeComparator)(1, 2)).toEqual(
      ComparisonResult.GREATER_THAN
    );
  });
});
