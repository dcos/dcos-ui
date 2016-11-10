module.exports = {

  /**
   * Indent the given fragments
   */
  indentFragments(fragments, prefix='\t') {
    return fragments.map(function(line) {
      return `${prefix}${line}`;
    });
  }

};
