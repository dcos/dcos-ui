module.exports = {

  /**
   * Indent the given fragments
   *
   * @param {Array} fragments - An array with the code lines
   * @param {String} [prefix] - The prefix to prepend for indentation
   * @returns {Array} - Returns the indented code lines
   */
  indentFragments(fragments, prefix='\t') {
    return fragments.map(function (line) {
      return `${prefix}${line}`;
    });
  }

};
