/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import HealthSorting from '../constants/HealthSorting';
import TableUtil from '../../../../../src/js/utils/TableUtil';
import TaskStatusSortingOrder from '../constants/TaskStatusSortingOrder';
import Util from '../../../../../src/js/utils/Util';

function getUpdatedTimestamp(model) {
  const lastStatus = Util.last(model.statuses);

  return (lastStatus && lastStatus.timestamp) || null;
}

const TaskTableUtil = {
  /**
   * Normalize param received and try mapping to HealthSorting
   * if not able to mapping default to HealthSorting.NA
   *
   * @param {String} name
   * @returns {Number} HealthSorting value
   */
  getHealthValueByName(name) {
    let match;
    name = Util.toUpperCaseIfString(name);
    match = HealthSorting[name];

    // defaults to NA if can't map to a HealthTypes key
    if ( typeof match !== 'number' ) {
      match = HealthSorting.NA;
    }

    return match;
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

    a = TaskTableUtil.getHealthValueByName(a.health);
    b = TaskTableUtil.getHealthValueByName(b.health);

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
  getHealthSorting() {
    return TaskTableUtil.sortHealthValues;
  },

  getSortFunction(tieBreakerProp) {
    return TableUtil.getSortFunction(tieBreakerProp, function (item, prop) {
      const hasGetter = typeof item.get === 'function';

      if (prop === 'updated') {
        return getUpdatedTimestamp(item) || 0;
      }

      if (prop === 'status' && !hasGetter) {
        return TaskStatusSortingOrder[item.state];
      }

      if (prop === 'cpus' || prop === 'mem' || prop === 'disk') {
        // This is necessary for tasks, since they are not structs
        let value = item[prop];

        if (!value && hasGetter) {
          value = item.get(prop);
        }

        if (item.getUsageStats) {
          value = item.getUsageStats(prop).value;
        }

        if (Util.findNestedPropertyInObject(item, `resources.${prop}`)) {
          value = item.resources[prop];
        }

        if (Array.isArray(value)) {
          return Util.last(value).value;
        }

        return value;
      }

      // This is necessary for tasks, since they are not structs
      if (!hasGetter) {
        return item[prop];
      }

      return item.get(prop);
    });
  }
};

module.exports = TaskTableUtil;
