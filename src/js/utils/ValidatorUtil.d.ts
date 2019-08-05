export default {
  isCallable: (value: any) => boolean,
  isDefined: (value: any) => boolean,
  isEmail: (value: string) => boolean,
  isEmpty: (value: any) => boolean,
  isInteger: (value: any) => boolean,
  isNumber: (value: any) => boolean,
  isNumberInRange: (value: any, range: { min?: number; max?: number } = {}) =>
    boolean,
  isStringInteger: (value: string | any) => boolean
};
