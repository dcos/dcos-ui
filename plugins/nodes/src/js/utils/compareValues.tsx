// TODO: DCOS-39081
export function compareValues(
  a: string | null,
  b: string | null,
  aTieBreaker: string,
  bTieBreaker: string
) {
  if (a === b || a == null || b == null) {
    a = aTieBreaker;
    b = bTieBreaker;
  }

  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }

  return 0;
}
