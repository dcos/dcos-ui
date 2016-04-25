import UnitHealthStatus from '../constants/UnitHealthStatus';
import TableUtil from '../utils/TableUtil';
import Util from '../utils/Util';

const UnitHealthUtil = {
  getHealthSortFunction: function (...args) {
    return TableUtil.getSortFunction('id', function (item, prop) {
      if (prop === 'health') {
        return UnitHealthUtil.getHealthSorting(item);
      }

      if (prop === 'id' || prop === 'name') {
        return item.getTitle();
      }

      return item.get(prop);
    })(...args);
  },

  // Gets the HealthSorting weight of a Node or HealthUnit
  getHealthSorting(item) {
    return item.getHealth().value;
  },

  /**
   * Get UnitHealthStatus object representing the health of an Item
   * @param {Number} health - The health integer from Component Health API.
   * @return {Object}       - UnitHealthStatus object.
   */
  getHealth(health) {
    let healthKey = Util.find(Object.keys(UnitHealthStatus), function (key) {
      return (UnitHealthStatus[key].value === health);
    });

    return UnitHealthStatus[healthKey] || UnitHealthStatus.NA;
  },

  /**
   * Filter a List by UnitHealth.
   * @param {Array}  items  - Array of Nodes or HealthUnits to be filtered.
   * @param {String} health - Health title to filter by.
   * @return {Array}        - Array of filtered objects.
   */
  filterByHealth(items, health) {
    health = health.toLowerCase();

    if (health === 'all') {
      return items;
    }

    return items.filter(function (datum) {
      return datum.getHealth().title.toLowerCase() === health;
    });
  }

};

module.exports = UnitHealthUtil;
