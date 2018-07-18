import { sort } from "../";

describe("sort", () => {
  it("does not mutate the input array", () => {
    const list = [1, 3, 4, 2];
    sort<number>([(a, b) => (a > b ? -1 : 1)], list);
    expect(list).toEqual([1, 3, 4, 2]);
  });

  it("returns the original array if called without sorting functios", () => {
    const list = [1, 3, 4, 2];
    const sortedList = sort<number>([], list);
    expect(sortedList).toEqual([1, 3, 4, 2]);
  });

  it("sorts by the sorting function", () => {
    const list = [1, 3, 4, 2];
    const sortedList = sort<number>([(a, b) => (a > b ? -1 : 1)], list);
    expect(sortedList).toEqual([4, 3, 2, 1]);
  });

  it("uses the second comparator as a tie breaker", () => {
    const list = ["1", "3", "001", "03"];
    const sortByNumericValue = (a: string, b: string) => {
      const parsedA = parseInt(a, 10);
      const parsedB = parseInt(b, 10);

      if (parsedA === parsedB) {
        return 0;
      }

      return parsedA < parsedB ? -1 : 1;
    };
    const sortByLength = (a: string, b: string) =>
      a.length > b.length ? -1 : 1;

    const sortedList = sort<string>([sortByNumericValue, sortByLength], list);
    expect(sortedList).toEqual(["001", "1", "03", "3"]);
  });
});
