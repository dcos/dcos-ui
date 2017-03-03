module.exports = {

  /**
   * Return the element's text input, remove duplicate whitespaces, replace
   * newlines with spaces and convert it to lower-case.
   *
   * @param {DOMElement} element - The HTML DOM element to extract the text from
   * @returns {String} Returns the normalized string contents
   */
  getNormalizedContents(element) {
    return element.innerText.replace(/[\r\n\s+]+/g, ' ').trim().toLowerCase();
  }

};
