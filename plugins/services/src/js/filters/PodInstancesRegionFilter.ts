import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import InstanceUtil from "../utils/InstanceUtil";

export default {
  /**
   * Handle all `region:XXXX` attribute filters that we can handle.
   */
  filterCanHandle(filterType, { label }) {
    return filterType === DSLFilterTypes.ATTRIB && label === "region";
  },

  /**
   * Keep only instances whose region matches the value of
   * the `region` label
   */
  filterApply(resultSet, _filterType, { text }) {
    const region = text.toLowerCase();
    return resultSet.filterItems(
      (instance) =>
        InstanceUtil.getNode(instance)?.getRegionName().toLowerCase() === region
    );
  },
};
