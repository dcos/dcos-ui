import { Comparator, reverseComparator } from "@dcos/sorting";

// TODO: DCOS-39080
export type SortDirection = "ASC" | "DESC";

export function directionAwareComparators<T>(
  comparators: Array<Comparator<T>>,
  sortDirection: SortDirection
) {
  return comparators.map(
    compareFn =>
      sortDirection === "ASC" ? compareFn : reverseComparator(compareFn)
  );
}
