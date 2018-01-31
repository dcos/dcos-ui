import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";
import InstanceUtil from "../utils/InstanceUtil";

const LABEL = "zone";

/**
 * This filter handles the `zone:XXXX` for instances
 */
class PodInstancesZoneFilter extends DSLFilter {
  constructor(zones = []) {
    super();
    this.zones = zones;
  }
  /**
   * Handle all `zone:XXXX` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    const zones = this.zones;

    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      zones.includes(filterArguments.text.toLowerCase())
    );
  }

  /**
   * Keep only instances whose zone matches the value of
   * the `zone` label
   *
   * @override
   */
  filterApply(resultSet, filterType, filterArguments) {
    let zone = "";
    const filterArgumentsValue = filterArguments.text.toLowerCase();

    if (this.zones.includes(filterArgumentsValue)) {
      zone = filterArgumentsValue;
    }

    return resultSet.filterItems(instance => {
      const node = InstanceUtil.getNode(instance);

      return node.getZoneName().toLowerCase() === zone;
    });
  }
}

module.exports = PodInstancesZoneFilter;
