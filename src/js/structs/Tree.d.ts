import List from "./List";

export default class Tree<A> extends List<A> {
  flattenItems(): List;
  filterItems<A>(callback: (a: A) => boolean): Tree<A>;
  filterItemsByText(filterText: string, filterProperties: any): any;
  findItem(callback: any): any;
  mapItems(callback: any): any;
  reduceItems(callback: any, initialValue: any): any;
}
