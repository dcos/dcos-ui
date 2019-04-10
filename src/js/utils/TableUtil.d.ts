export function getRowHeight(): number;
export function compareValues(
  a: string,
  b: string,
  aTieBreaker: string,
  bTieBreaker: string
): number;
export function getSortFunction(
  tieBreakerProp: string,
  getProperty?: () => void
): (a: string, b: string, aTieBreaker: string, bTieBreaker: string) => number;
export function getHealthSortingValue(healthValue: string | number): number;
export function sortHealthValues(
  a: {
    name: string;
    health: string | number;
  },
  b: {
    name: string;
    health: string | number;
  }
): number;
export function getHealthSortingOrder(): (
  a: {
    name: string;
    health: string | number;
  },
  b: {
    name: string;
    health: string | number;
  }
) => number;
export function isColWidthCustom(
  colWidthsStorageKey: string,
  columnKey: string
): boolean;
