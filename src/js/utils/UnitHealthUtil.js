import UnitHealthStatus from "../constants/UnitHealthStatus";
import UnitHealthTypes from "../constants/UnitHealthTypes";
import TableUtil from "../utils/TableUtil";
import Util from "../utils/Util";

const UnitHealthUtil = {
  getHealthSortFunction(...args) {
    return TableUtil.getSortFunction("id", function(item, prop) {
      // TODO: Deprecate sorting conditions by prop
      if (prop === "health") {
        return UnitHealthUtil.getHealthSorting(item);
      }

      if (prop === "id" || prop === "name") {
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
    const healthKey = Object.keys(UnitHealthStatus).find(function(key) {
      return UnitHealthStatus[key].value === health;
    });

    return (
      UnitHealthStatus[healthKey] || UnitHealthStatus[UnitHealthTypes.SERVER_NA]
    );
  },

  /**
   * Filter a List by UnitHealth.
   * @param {Array}  items  - Array of Nodes or HealthUnits to be filtered.
   * @param {String} health - Health title to filter by.
   * @return {Array}        - Array of filtered objects.
   */
  filterByHealth(items, health) {
    health = Util.toLowerCaseIfString(health);

    if (health === "all") {
      return items;
    }

    return items.filter(function(datum) {
      if (health.length > 1) {
        return Util.toLowerCaseIfString(datum.getHealth().title) === health;
      }

      return datum.getHealth().value === +health;
    });
  }
};

export default UnitHealthUtil;
