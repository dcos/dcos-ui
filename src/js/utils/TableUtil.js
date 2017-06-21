function toLowerCaseIfString(item) {
  if (typeof item === "string") {
    return item.toLowerCase();
  }

  return item;
}

var TableUtil = {
  /**
   * WARNING: When removing/modifying this function be aware of comments/sizes
   * in variables-layout.less
   * Returns an integer of what the expected height of a
   * row will be given the current window dimensions.
   *
   * @return {Integer} Expected row height
   */
  getRowHeight() {
    const defaultRowSize = 29;
    const definitionList = {
      mini: { screen: 480, rowHeight: 32 },
      small: { screen: 768, rowHeight: 37 },
      medium: { screen: 992, rowHeight: 45 },
      large: { screen: 1270, rowHeight: 52 }
    };

    let rowHeight = null;
    const windowWidth = global.innerWidth;
    Object.keys(definitionList).forEach(function(size) {
      if (windowWidth >= definitionList[size].screen) {
        rowHeight = definitionList[size].rowHeight;
      }
    });

    return rowHeight || defaultRowSize;
  },

  compareValues(a, b, aTieBreaker, bTieBreaker) {
    a = toLowerCaseIfString(a);
    b = toLowerCaseIfString(b);
    aTieBreaker = toLowerCaseIfString(aTieBreaker);
    bTieBreaker = toLowerCaseIfString(bTieBreaker);
    if (a === b || a == null || b == null) {
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
   * High order function that will provide another high order function to get
   * sort function for tables.
   * @param  {String} tieBreakerProp property to break ties with
   * @param  {Function} getProperty function that takes an item and a
   * property string and returns a value
   *
   * @return {Function} A high order function that will, given a property
   * string and a sort order ('asc' or 'desc'), return a comparator function
   * between two items
   */
  getSortFunction(tieBreakerProp, getProperty) {
    return function(prop, order) {
      return function(a, b) {
        return TableUtil.compareValues(
          getProperty(a, prop, order),
          getProperty(b, prop, order),
          getProperty(a, tieBreakerProp, order),
          getProperty(b, tieBreakerProp, order)
        );
      };
    };
  }
};

module.exports = TableUtil;
