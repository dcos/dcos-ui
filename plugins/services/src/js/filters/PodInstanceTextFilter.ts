import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";

/**
 * This filter handles the `text` attributes against pod instance's `id` value
 */
export default {
  /**
   * Handle all `id` attribute filters that we can handle.
   */
  filterCanHandle(filterType) {
    return (
      filterType === DSLFilterTypes.EXACT || filterType === DSLFilterTypes.FUZZY
    );
  },

  /**
   * Keep only tasks whose id contains part of the filter's text
   *
   * @override
   */
  filterApply(resultSet, _filterType, { text }) {
    const filteredItems = resultSet.filterItems(({ id }) => id.includes(text));
    return filteredItems.list.length !== 0 ? filteredItems : resultSet;
  },
};
