import Item from './Item';
import StringUtil from '../utils/StringUtil';

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
function cast(item) {
  let Type = this.constructor.type;
  if (Type != null && !(item instanceof Type)) {
    return new Type(item);
  }
  return item;
}

module.exports = class List {
  /**
   * List
   * @param {{
   *          items:array,
   *          filterProperties:{propertyName:(null|function)}
   *        }} options
   * @property {Class} type - the type of list items
   * @constructor
   * @struct
   */
  constructor(options = {}) {
    this.list = [];

    if (options.items) {
      if (!Array.isArray(options.items)) {
        throw new Error('Expected an array.');
      }
      if (this.constructor.type != null) {
        this.list = options.items.map(cast.bind(this));
      } else {
        this.list = options.items;
      }

    }

    this.filterProperties = options.filterProperties || {};
  }

  add(item) {
    this.list.push(cast.call(this, item));
  }

  getItems() {
    return this.list;
  }

  getFilterProperties() {
    return this.filterProperties;
  }

  last() {
    return this.list[this.list.length - 1];
  }

  /**
   * @param {function} callback Function to test each element of the array,
   * taking three arguments: item, index, list. Return true to keep the item,
   * false otherwise.
   * @return {List} List (or child class) containing mapped items
   */
  filterItems(callback) {
    let items = this.getItems().filter((item, index) => {
      return callback(item, index, this);
    });

    return new this.constructor({items});
  }

  /**
   * Filters items in list and returns a new instance of the list used.
   * @param  {string} filterText string to search in properties of the list
   * @param  {{propertyName:(null|function)}} [filterProperties] object
   *     to configure filter properties as well as their getters
   * @return {List} List (or child class) containing filtered items
   */
  filterItemsByText(filterText, filterProperties = this.getFilterProperties()) {
    let items = this.getItems();

    if (filterText) {
      items = StringUtil.filterByString(items, function (item) {
        let searchFields = Object.keys(filterProperties).map(function (prop) {
          // We need different handlers for item getters since the property
          // since there can be different ways of getting the value needed

          // Use getter function if specified in filterProperties.
          // This is used if property is nested or type is different than string
          let valueGetter = filterProperties[prop];
          if (typeof valueGetter === 'function') {
            return valueGetter(item, prop);
          }

          // Use default getter if item is an instanceof Item.
          // This is the regular way of getting a property on an item
          if (item instanceof Item) {
            return item.get(prop) || '';
          }

          // Last resort is to get property on object.
          // Some of the items in lists are not always of instance Item and
          // therefore we might need to get it directly on the object
          return item[prop] || '';
        });

        return searchFields.join(' ');
      }, filterText);
    }

    return new this.constructor({items});
  }

  /**
   * @param {function} callback Function to execute on each value in the array,
   * taking one argument: item
   * @return {object} matching item
   */
  findItem(callback) {
    return this.getItems().find(callback);
  }

  /**
   * @param {function} callback Function that produces an item of the new
   * List, taking three arguments: item, index, list
   * @return {List} List (or child class) containing mapped items
   */
  mapItems(callback) {
    let items = this.getItems().map((item, index) => {
      return callback(item, index, this);
    });

    return new this.constructor({items});
  }

  /**
   * @param {function} callback Function to execute on each value in the
   * array, taking four arguments: previousValue, currentValue, index, list
   * @param {*} initialValue
   * @returns {*} returnValue
   */
  reduceItems(callback, initialValue) {
    return this.getItems().reduce((previousValue, currentValue, index) => {
      return callback(previousValue, currentValue, index, this);
    }, initialValue);
  }
};
