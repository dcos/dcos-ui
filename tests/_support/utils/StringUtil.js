module.exports = {
  /**
   * Return the element's text contents, convert new lines to spaces and then
   * trim duplicate whitespaces.
   *
   * @param {DOMElement} element - The HTML DOM element to extract the text from
   * @returns {String} Returns the normalized string contents
   */
  getContents(element) {
    return element.innerText.replace(/[\r\n\s+]+/g, " ").trim();
  }
};
