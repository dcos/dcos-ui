import _ from 'underscore';
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
          _.extend({filterProperties: this.getFilterProperties()}, item)
        );
      }

      return item;
    });

  }

  /**
   * Filters items in tree and returns a new instance of the tree used, even if
   * it just extends List
   * @param  {string} filterText string to search in properties of the list
   * @return {Tree} Tree (or child class) containing filtered items
   */
  filterItems(filterText) {
    let items = this.getItems();
    let filterProperties = this.getFilterProperties();

    if (filterText) {
      var regex = StringUtil.escapeForRegExp(filterText);
      var searchPattern = new RegExp(regex, 'i');

      items = items.map(function (item) {
        // Filter subtrees
        if (item instanceof Tree) {
          return item.filterItems(filterText);
        }
        return item;
      }).filter(function (item) {
        // Remove empty subtrees
        if (item instanceof Tree) {
          return item.getItems().length > 0;
        }

        // Filter items by property values
        return Object.keys(filterProperties).some(function (prop) {
          // We need different handlers for item getters since the property
          // since there can be different ways of getting the value needed

          // Use getter function if specified in filterProperties.
          // This is used if property is nested or type is different than string
          let valueGetter = filterProperties[prop];
          if (typeof valueGetter === 'function') {
            return searchPattern.test(valueGetter(item, prop));
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

    return new this.constructor(_.extend({}, this, {items}));
  }
};
