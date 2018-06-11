import Item from "./Item";

export default class List {
  add(item: any): Number;
  getItems(): any[];
  getFilterProperties(): object;
  last(): any;
  combine(list: List): List;
  filterItems(
    callback: (item: any, index: Number, list: List) => boolean
  ): List;
  filterItemsByText(filterText: string, filterProperties: object): List;
  findItem(callback: (item: any) => boolean): any;
  mapItems(callback: (item: any, index: number) => any): List;
  reduceItems(
    callback: (
      previousValue: any,
      currentValue: any,
      index: Number,
      list: List
    ) => any,
    initialValue: any
  ): any;
}
