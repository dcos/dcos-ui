export interface Definition {
  showError: false;
  externalValidator: (model: object, definition: Definition) => void;
}

export function getMultipleFieldDefinition(
  prop: string,
  id: number,
  definition: any[],
  model: object,
  index?: number
): any[];
export function modelToCombinedProps(model: object): object;
export function isFieldInstanceOfProp(
  prop: string,
  field: object,
  id: number
): boolean;
export function removePropID(
  definition: Definition[],
  prop: string,
  id: number
): void;
export function getProp(key: string): string;
export function getPropIndex(key: string): number;
export function getPropKey(key: string): string;
export function forEachDefinition(
  definition: Definition[] | Definition,
  callback: (definition: Definition) => void
): void;
