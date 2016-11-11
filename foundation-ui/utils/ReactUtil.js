import React from 'react';

const ReactUil = {
  /**
   * Wrap React elements
   *
   * @param {Array.<ReactElement>|ReactElement} elements
   * @param  {function|String} wrapper component
   * @param {boolean} [alwaysWrap]
   *
   * @returns {ReactElement} wrapped react elements
   */
  wrapElements(elements, wrapper = 'div', alwaysWrap = false) {
    if (elements == null && !alwaysWrap) {
      return null;
    }

    if (React.isValidElement(elements) && !alwaysWrap) {
      return elements;
    }

    return React.createElement(wrapper, null, elements);
  }
};

module.exports = ReactUil;

