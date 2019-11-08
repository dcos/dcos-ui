export default {
  isDefined: (value: any) => boolean,
  isEmpty: (value: any) => boolean,
  isInteger: (value: any) => boolean,
  isNumber: (value: any) => boolean,
  isNumberInRange: (value: any, range: { min?: number; max?: number } = {}) =>
    boolean,
  isStringInteger: (value: string | any) => boolean
};
