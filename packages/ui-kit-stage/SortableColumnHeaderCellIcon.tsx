/**
 * Component: SortableColumnHeaderCellIcon
 * Added: 2018-07-08
 * JIRA: https://jira.mesosphere.com/browse/DCOS-39076
 */
import * as React from "react";

type SortDirection = "ASC" | "DESC" | null;

export function SortableColumnHeaderCellIcon({
  sortDirection
}: {
  sortDirection: SortDirection;
}) {
  if (sortDirection === null) {
    return null;
  }
  // TODO: DCOS-39067
  const icon = sortDirection === "ASC" ? "↗️" : "↘️";
  return <span>{icon}</span>;
}
