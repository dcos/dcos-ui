import { DSLFilterTypes, DSLFilter } from "@d2iq/dsl-filter";

const LABEL = "zone";

/**
 * This filter handles the `zone:XXXX` for nodes
 */
class NodesZoneFilter extends DSLFilter {
  constructor(zones) {
    super();
    this.zones = [];

    if (Array.isArray(zones)) {
      this.zones = zones;
    }
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
   * Keep only nodes whose zone matches the value of
   * the `zone` label
   *
   * @override
   */
  filterApply(resultSet, filterType, filterArguments) {
    let zone = "";
    const filterArgumentsText = filterArguments.text.toLowerCase();
    if (this.zones.includes(filterArgumentsText)) {
      zone = filterArgumentsText;
    }

    return resultSet.filterItems(node => {
      return node.getZoneName().toLowerCase() === zone;
    });
  }
}

module.exports = NodesZoneFilter;
