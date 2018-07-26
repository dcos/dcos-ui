export enum ComparisonResult {
  GREATER_THAN = 1,
  EQUAL = 0,
  LESS_THAN = -1
}
export type Comparator<T> = (a: T, b: T) => ComparisonResult;
export type Getter<I, T> = (data: I) => T;
type compareWithGetter<T> = <I>(getter: Getter<I, T>) => Comparator<I>;

function sortByComparators<T>(
  a: T,
  b: T,
  comparators: Array<Comparator<T>>
): ComparisonResult {
  if (!comparators.length) {
    return 0;
  }

  const [comparator, ...otherComparators] = comparators;
  const result = comparator(a, b);
  return result !== 0 ? result : sortByComparators(a, b, otherComparators);
}

export function sort<T>(comparators: Array<Comparator<T>>, data: T[]): T[] {
  return [...data].sort((a, b) => sortByComparators(a, b, comparators));
}

export function reverseComparator<T>(comparator: Comparator<T>): Comparator<T> {
  return (a, b) => {
    const previousResult = comparator(a, b);

    if (previousResult === ComparisonResult.EQUAL) {
      return previousResult;
    } else {
      return (-1 * previousResult) as ComparisonResult;
    }
  };
}

function compareStringValues(a: string, b: string): ComparisonResult {
  // Does not always return -1 or 1: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#Description
  const result = a.localeCompare(b);
  if (result === 0) {
    return ComparisonResult.EQUAL;
  }

  return result > 0
    ? ComparisonResult.GREATER_THAN
    : ComparisonResult.LESS_THAN;
}

function compareNumericValues(a: number, b: number): ComparisonResult {
  if (a === b) {
    return ComparisonResult.EQUAL;
  }

  return a < b ? ComparisonResult.LESS_THAN : ComparisonResult.GREATER_THAN;
}

function comparatorWithGetter<I, T>(
  comparator: Comparator<T>
): (getter: Getter<I, T>) => Comparator<I> {
  return getter => (a, b) => comparator(getter(a), getter(b));
}

export const compareString: compareWithGetter<string> = comparatorWithGetter(
  compareStringValues
);
export const compareNumber: compareWithGetter<number> = comparatorWithGetter(
  compareNumericValues
);
