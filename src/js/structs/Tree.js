import Item from './Item';
import List from './List';
import StringUtil from '../utils/StringUtil';
import Util from '../utils/Util';

module.exports = class Tree extends List {
  /**
   * Tree
   * @param {{
   *          items:array<({items:array}|*)>,
   *          filterProperties:{propertyName:(null|string|function)}
   *        }} options
   * @constructor
   * @struct
   */
  constructor(options = {}) {
    super(options);

    // Replace tree like items instances of Tree
    this.list = this.list.map((item) => {
      if ((item.items != null && Util.isArray(item.items)) &&
          !(item instanceof Tree)) {
        return new this.constructor(
          Object.assign({filterProperties: this.getFilterProperties()}, item)
        );
      }

      return item;
    });
  }

  /**
   * @return {List} flat List of all items
   */
  flattenItems() {
    let items = this.getItems().reduce(function (current, item) {
      current.push(item);
      if (item instanceof Tree) {
        return current.concat(item.flattenItems().getItems());
      }

      return current;
    }, []);

    return new List({items});
  }

  /**
   * Filters items in tree and returns a new instance of the tree used, even if
   * it just extends List
   * @param  {string} filterText string to search in properties of the list
   * @return {Tree} Tree (or child class) containing filtered items
   */
  filterItemsByText(filterText) {
    let items = this.getItems();
    let filterProperties = this.getFilterProperties();

    if (filterText) {
      let regex = StringUtil.escapeForRegExp(filterText);
      let searchPattern = new RegExp(regex, 'i');

      items = items.map(function (item) {
          // Filter subtrees
          if (item instanceof Tree) {
            return item.filterItemsByText(filterText);
          }

          return item;
        })
        .filter(function (item) {
          // Don't filter subtrees with matching items
          if (item instanceof Tree && item.getItems().length > 0) {
            return true;
          }

          // Filter items by property values
          return Object.keys(filterProperties).some(function (prop) {
            // We need different handlers for item getters since the property
            // there can be different ways of getting the value needed

            // Use getter function if specified in filterProperties.
            // This is used if property is nested or type is different than string
            let valueGetter = filterProperties[prop];
            if (typeof valueGetter === 'function') {
              return searchPattern.test(valueGetter(item, prop) || '');
            }

            // Use default getter if item is an instanceof Item.
            // This is the regular way of getting a property on an item
            if (item instanceof Item) {
              return searchPattern.test(item.get(prop) || '');
            }

            // Last resort is to get property on object.
            // Some of the items in lists are not always of instance Item and
            // therefore we might need to get it directly on the object
            return searchPattern.test(item[prop] || '');
          });

        });
    }

    return new this.constructor(Object.assign({}, this, {items}));
  }

  /**
   * @param {function} callback Function to execute on each value in the array,
   * taking one argument: item
   * @return {object} matching item
   */
  findItem(callback) {
    return this.flattenItems().findItem(callback);
  }

  /**
   * @param {function} callback Function that produces an item of the new
   * Tree, taking three arguments: item, index, tree
   * @return {Tree} Tree (or child class) containing mapped items
   */
  mapItems(callback) {
    let items = this.getItems().map((item, index) => {
      if (item instanceof Tree) {
        return callback(item.mapItems(callback), index, this);
      }

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
      let returnValue = callback(previousValue, currentValue, index, this);
      if (currentValue instanceof Tree) {
        returnValue = currentValue.reduceItems(callback, returnValue);
      }
      return returnValue;
    }, initialValue);
  }
};
