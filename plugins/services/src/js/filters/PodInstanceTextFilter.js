import { DSLFilterTypes, DSLFilter } from "@d2iq/dsl-filter";

/**
 * This filter handles the `text` attributes against pod instance's `id` value
 */
class PodInstanceTextFilter extends DSLFilter {
  /**
   * Handle all `id` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType) {
    return (
      filterType === DSLFilterTypes.EXACT || filterType === DSLFilterTypes.FUZZY
    );
  }

  /**
   * Keep only tasks whose id contains part of the filter's text
   *
   * @override
   */
  filterApply(resultSet, filterType, filterArguments) {
    const filteredItems = resultSet.filterItems(instance => {
      return instance.id.indexOf(filterArguments.text) !== -1;
    });

    if (
      filteredItems.getItems().length !== 0 &&
      filteredItems.getItems().length < resultSet.getItems().length
    ) {
      return filteredItems;
    }

    return resultSet;
  }
}

module.exports = PodInstanceTextFilter;
