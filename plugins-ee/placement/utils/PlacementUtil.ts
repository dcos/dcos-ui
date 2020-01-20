import CompositeState from "#SRC/js/structs/CompositeState";

export function isRegionConstraint(fieldName, operator) {
  return fieldName === "@region" && operator === "IS";
}

export function isZoneConstraint(fieldName, operator) {
  return fieldName === "@zone" && operator === "GROUP_BY";
}

export function getRegionOptionText(region) {
  const masterNode = CompositeState.getMasterNode();
  const masterNodeZone = masterNode.getRegionName();

  return `${region}${masterNodeZone === region ? " (Local)" : ""}`;
}
