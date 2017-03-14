module.exports = {

  getNormalizedContents(element) {
    return element.innerText.replace(/[\r\n\s+]+/g, ' ').trim().toLowerCase();
  }

};
