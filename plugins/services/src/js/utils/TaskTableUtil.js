/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import HealthSorting from "../constants/HealthSorting";
import MarathonStore from "../stores/MarathonStore";
import TableUtil from "../../../../../src/js/utils/TableUtil";
import TaskStatusSortingOrder from "../constants/TaskStatusSortingOrder";
import Util from "../../../../../src/js/utils/Util";

function getUpdatedTimestamp(model) {
  const lastStatus = Util.last(model.statuses);

  return (lastStatus && lastStatus.timestamp) || null;
}

const TaskTableUtil = {
  getSortFunction(tieBreakerProp) {
    return TableUtil.getSortFunction(tieBreakerProp, function(item, prop) {
      const hasGetter = typeof item.get === "function";

      if (prop === "updated") {
        return getUpdatedTimestamp(item) || 0;
      }

      if (prop === "health") {
        return HealthSorting[
          MarathonStore.getServiceHealth(item.get("name")).key
        ];
      }

      if (prop === "status" && !hasGetter) {
        return TaskStatusSortingOrder[item.state];
      }

      if (prop === "cpus" || prop === "mem" || prop === "disk") {
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
