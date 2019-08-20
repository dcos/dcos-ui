import Item from "./Item";

export default class List<A> {
  add(item: any): number;
  getItems(): A[];
  getFilterProperties(): object;
  isEmpty(): boolean;
  last(): A;
  combine(list: List<A>): List<A>;
  filterItems(
    callback: (item: A, index: number, list: List<A>) => boolean
  ): List<A>;
  filterItemsByText(filterText: string, filterProperties: object): List<A>;
  findItem(callback: (item: A) => boolean): A | null;
  mapItems<B>(callback: (item: A, index: number) => B): List<B>;
  reduceItems<B>(
    callback: (
      previousValue: B,
      currentValue: A,
      index: number,
      list: List<A>
    ) => B,
    initialValue: B
  ): B;
}
