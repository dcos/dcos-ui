export function isRegionConstraint(fieldName, operator) {
  return fieldName === "@region" && operator === "IS";
}

export function isZoneConstraint(fieldName, operator) {
  return fieldName === "@zone" && operator === "GROUP_BY";
}
