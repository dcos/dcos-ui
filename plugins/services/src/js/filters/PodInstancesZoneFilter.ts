import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import InstanceUtil from "../utils/InstanceUtil";

export default {
  /**
   * Handle all `zone:XXXX` attribute filters that we can handle.
   */
  filterCanHandle(filterType, { label }) {
    return filterType === DSLFilterTypes.ATTRIB && label === "zone";
  },

  /**
   * Keep only instances whose zone matches the value of
   * the `zone` label
   */
  filterApply(resultSet, _filterType, { text }) {
    const zone = text.toLowerCase();
    return resultSet.filterItems(
      (instance) =>
        InstanceUtil.getNode(instance)?.getZoneName().toLowerCase() === zone
    );
  },
};
