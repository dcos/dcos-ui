export interface Definition {
  showError: false;
  externalValidator: (model: object, definition: Definition) => void;
}

export function getMultipleFieldDefinition(
  prop: string,
  id: Number,
  definition: any[],
  model: object,
  index?: Number
): any[];
export function modelToCombinedProps(model: object): object;
export function isFieldInstanceOfProp(
  prop: string,
  field: object,
  id: Number
): boolean;
export function removePropID(
  definition: Definition[],
  prop: string,
  id: Number
): void;
export function getProp(key: string): string;
export function getPropIndex(key: string): Number;
export function getPropKey(key: string): string;
export function forEachDefinition(
  definition: Definition[] | Definition,
  callback: (definition: Definition) => void
): void;
export function isFieldDefinition(fieldDefinition: Definition): boolean;
