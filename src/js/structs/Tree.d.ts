import List from "./List";

export default class Tree extends List {
  flattenItems(): List;
  filterItems(callback: any): any;
  filterItemsByText(filterText: string, filterProperties: any): any;
  findItem(callback: any): any;
  mapItems(callback: any): any;
  reduceItems(callback: any, initialValue: any): any;
}