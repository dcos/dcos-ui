/**
 * Component: SortableColumnHeader
 * Added: 2018-07-08
 * JIRA: https://jira.mesosphere.com/browse/DCOS-39076
 */
import * as React from "react";
import { SortableColumnHeaderCellIcon } from "ui-kit-stage/SortableColumnHeaderCellIcon";

type SortDirection = "ASC" | "DESC" | null;

export function SortableColumnHeader({
  sortHandler,
  sortDirection,
  columnContent
}: {
  sortHandler: () => void;
  sortDirection: SortDirection;
  columnContent: string | React.ReactNode;
}) {
  // TODO: DCOS-39069
  return (
    <span onClick={sortHandler}>
      {columnContent}
      <SortableColumnHeaderCellIcon sortDirection={sortDirection} />
    </span>
  );
}
