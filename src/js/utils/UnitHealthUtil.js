import UnitHealthStatus from '../constants/UnitHealthStatus';
import TableUtil from '../utils/TableUtil';
import Util from '../utils/Util';

const UnitHealthUtil = {
  getHealthSortFunction(...args) {
    return TableUtil.getSortFunction('id', function (item, prop) {
      // TODO: Deprecate sorting conditions by prop
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
    const healthKey = Object.keys(UnitHealthStatus).find(function (key) {
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
  },

  /**
   * Map original health status to sorting health value
   * or return default NA
   *
   * @param {Number} healthValue
   * @returns {Number} Health Sorting value
   */
  getSortingValueByhealthValue(healthValue) {
    if (typeof healthValue !== 'number') {
      return UnitHealthStatus.NA.sortingValue;
    }

    return UnitHealthStatus[healthValue].sortingValue;
  },

  /**
   * Order health status
   * based on HealthSorting mapping value
   * where lowest (0) (top of the list) is most important for visibility
   * and highest (3) (bottom of the list) 3 is least important for visibility
   *
   * @param {Object} a
   * @param {Object} b
   * @returns {Number} item position
   */
  sortHealthValues(a, b) {
    const aTieBreaker = Util.toLowerCaseIfString(a.id);
    const bTieBreaker = Util.toLowerCaseIfString(b.id);

    a = UnitHealthUtil.getSortingValueByhealthValue(a.health);
    b = UnitHealthUtil.getSortingValueByhealthValue(b.health);

    if (a === b) {
      a = aTieBreaker;
      b = bTieBreaker;
    }

    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }

    return 0;
  },

/**
 *
 * @returns {Function} sortHealthValues
 */
  getHealthSortingOrder() {
    return UnitHealthUtil.sortHealthValues;
  }

};

module.exports = UnitHealthUtil;
