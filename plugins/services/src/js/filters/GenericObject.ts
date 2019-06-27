export function filterByObject(
  value: Record<string, unknown>,
  filterObj: Record<string, unknown>
): boolean {
  for (let key in filterObj) {
    if (key.length === 0) {
      continue;
    }
    if (!(key in value)) {
      if (filterObj[key] === undefined) {
        continue;
      }
      return false;
    }
    if (typeof filterObj[key] === typeof value[key]) {
      if (typeof value[key] === "object") {
        if (value[key] instanceof Array) {
          //TODO: Support arrays
          continue;
        } else if (
          !filterByObject(value[key] as object, filterObj[key] as object)
        ) {
          return false;
        }
        continue;
      }
      if (value[key] !== filterObj[key]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}
