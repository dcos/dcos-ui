import React from "react";

function getUnwrappedElements(elements) {
  if (
    Array.isArray(elements) &&
    elements.length === 1 &&
    React.isValidElement(elements[0])
  ) {
    return elements[0];
  }

  return elements;
}

function shouldWrapElements(elements, alwaysWrap) {
  return alwaysWrap || (Array.isArray(elements) && elements.length > 1);
}

const ReactUtil = {
  /**
   * Wrap React elements
   *
   * If elements is an array with a single element, it will not be wrapped
   * unless alwaysWrap is true.
   *
   * @param {Array.<ReactElement>|ReactElement} elements
   * @param  {function|String} wrapper component
   * @param {boolean} [alwaysWrap]
   *
   * @returns {ReactElement} wrapped react elements
   */
  wrapElements(elements, wrapper = "div", alwaysWrap = false) {
    if (elements == null && !alwaysWrap) {
      return null;
    }

    if (shouldWrapElements(elements, alwaysWrap)) {
      return React.createElement(wrapper, null, elements);
    }

    return getUnwrappedElements(elements, alwaysWrap);
  }
};

module.exports = ReactUtil;
