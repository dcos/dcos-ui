import Item from "./Item";
import ObjectUtil from "../utils/ObjectUtil";
import StringUtil from "../utils/StringUtil";

/**
 * Cast an item to the List's type, if specified.
 *
 * Note that cast must be bound to the List's context in order to access
 * its `type` property.
 *
 * @param {Object} item
 * @access private
 * @memberOf List
 * @return {Object} item, cast if list is typed.
 */
function cast(item: any) {
  const Type = this.constructor.type;
  if (Type != null && !(item instanceof Type)) {
    return new Type(item);
  }

  return item;
}

export default class List<A = {}> {
  public static type;
  public list: A[];
  public filterProperties: any;
  /**
   * List
   * @param {Object} options Options object
   * @param {Array} options.items
   * @param {{propertyName:(null|function)}} [options.filterProperties]
   * @property {Class} type - the type of list items
   * @constructor
   * @struct
   */
  constructor(options: { items?: A[]; filterProperties?: any } = {}) {
    this.list = [];

    if (options.items) {
      if (!Array.isArray(options.items)) {
        throw new Error("Expected an array.");
      }

      this.list =
        this.constructor.type != null
          ? options.items.map(cast.bind(this))
          : options.items;
    }

    this.filterProperties = options.filterProperties || {};
  }

  public add(item: A) {
    this.list.push(cast.call(this, item));
  }

  public getItems() {
    return this.list;
  }

  public getFilterProperties() {
    return this.filterProperties;
  }

  public last() {
    return this.list[this.list.length - 1];
  }

  /*
   * Return a new list with the items currently present in this list and
   * the list on the first argument, without duplicates.
   *
   * @param {List} list - The list to combine with this list
   * @returns {List} Returns a new list with the combined items
   */
  public combine(list: List<A>) {
    let actualLength = 0;
    const currentItems = this.getItems();
    const newItems = list.getItems();

    // We pre-allocate the result array with the worst possible scenario
    const combinedItems = new Array(currentItems.length + newItems.length);

    // Instead of using the O(n²) approach of iterating over `newItems` and
    // checking if each item exist on `currentItems`, we use a trick that brings
    // the complexity down to O(n) (well, O(2n) to be precise).

    // We first generate a unique object for the current combine operation
    // and we mark all the objects of `currentItems` with it, declaring them as
    // used.
    const comparisonTag = {};
    for (let i = 0, length = currentItems.length; i < length; ++i) {
      combinedItems[actualLength++] = ObjectUtil.markObject(
        currentItems[i],
        comparisonTag
      );
    }

    // We then iterate over the `newItems` and skip the objects that are already
    // marked from the previous step.
    for (let i = 0, length = newItems.length; i < length; ++i) {
      if (!ObjectUtil.objectHasMark(newItems[i], comparisonTag)) {
        combinedItems[actualLength++] = newItems[i];
      }
    }

    // Finally we trim-down the `combinedItems` array with the actual length
    // of the end result and we create the new list
    combinedItems.length = actualLength;

    return new this.constructor({ items: combinedItems });
  }

  /*
   * @param {function} callback Function to test each element of the array,
   * taking three arguments: item, index, list. Return true to keep the item,
   * false otherwise.
   * @return {List} List (or child class) containing mapped items
   */
  public filterItems(callback: (a: A, i: number, ctx: any) => boolean) {
    const items = this.getItems().filter((item, index) =>
      callback(item, index, this)
    );

    return new this.constructor({ items });
  }

  /*
   * Filters items in list and returns a new instance of the list used.
   * @param  {string} filterText string to search in properties of the list
   * @param  {{propertyName:(null|function)}} [filterProperties] object
   *     to configure filter properties as well as their getters
   * @return {List} List (or child class) containing filtered items
   */
  public filterItemsByText(
    filterText: string,
    filterProperties = this.getFilterProperties()
  ) {
    let items = this.getItems();

    if (filterText) {
      items = StringUtil.filterByString(
        items,
        (item: A) => {
          const searchFields = Object.keys(filterProperties).map(prop => {
            // We need different handlers for item getters since the property
            // since there can be different ways of getting the value needed

            // Use getter function if specified in filterProperties.
            // This is used if property is nested or type is different than string
            const valueGetter = filterProperties[prop];
            if (typeof valueGetter === "function") {
              return valueGetter(item, prop);
            }

            // Use default getter if item is an instanceof Item.
            // This is the regular way of getting a property on an item
            if (item instanceof Item) {
              return item.get(prop) || "";
            }

            // Last resort is to get property on object.
            // Some of the items in lists are not always of instance Item and
            // therefore we might need to get it directly on the object
            // FIXME

            return item[prop] || "";
          });

          return searchFields.join(" ");
        },
        filterText
      );
    }

    return new this.constructor({ items });
  }

  /**
   * @param {function} callback Function to execute on each value in the array,
   * taking one argument: item
   * @return {object} matching item
   */
  public findItem(callback: (a: A) => A | undefined) {
    return this.getItems().find(callback);
  }

  /**
   * @param {function} callback Function that produces an item of the new
   * List, taking three arguments: item, index, list
   * @return {List} List (or child class) containing mapped items
   */
  public mapItems<B>(callback: (a: A, i: number, ctx: any) => B) {
    const items = this.getItems().map((item, index) =>
      callback(item, index, this)
    );

    return new this.constructor({ items });
  }

  /**
   * @param {function} callback Function to execute on each value in the
   * array, taking four arguments: previousValue, currentValue, index, list
   * @param {*} initialValue
   * @returns {*} returnValue
   */
  public reduceItems<B>(
    callback: (b: B, a: A, i: number, ctx: any) => B,
    initialValue: B
  ) {
    return this.getItems().reduce(
      (previousValue, currentValue, index) =>
        callback(previousValue, currentValue, index, this),
      initialValue
    );
  }

  public isEmpty() {
    return !this.getItems() || !this.getItems().length;
  }
}
