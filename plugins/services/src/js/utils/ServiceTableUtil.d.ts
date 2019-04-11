export default class ServiceTableUtil {
  static sortData(prop: any, direction: any, data: any): any;
  static getFormattedVersion(service: any): any;
  numberCompareFunction(a: number, b: number): number;
  validateSemver(version: string): boolean;
  dottedNumberCompareFunction(a: string, b: string): any;
  nameCompareFunction(a: string, b: string): any;
  taskCompareFunction(a: any, b: any): any;
  statusCompareFunction(a: any, b: any): any;
  cpusCompareFunction(a: any, b: any): any;
  gpusCompareFunction(a: any, b: any): any;
  memCompareFunction(a: any, b: any): any;
  diskCompareFunction(a: any, b: any): any;
  instancesCompareFunction(a: any, b: any): any;
  versionCompareFunction(a: any, b: any): any;
  getCompareFunctionByProp(prop: any): any;
}
