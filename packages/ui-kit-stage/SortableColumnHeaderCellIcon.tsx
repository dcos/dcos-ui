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
  return sortDirection === "ASC" ? (
    <span className="caret caret--asc caret--visible" />
  ) : (
    <span className="caret caret--desc caret--visible" />
  );
}
