const StringUtil = require('./StringUtil');

/**
 * Return a configuration section
 *
 * Such section consists of all the sibling elements after an element
 * with a `configuration-map-heading` that contains the text given.
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String} title - The contents of the heading text to match
 * @param {String} [headingSelector] - The CSS selector to use to match the header
 */
Cypress.addChildCommand('configurationSection', function (elements, title, headingSelector='.configuration-map-heading') {
  const foundElements = [];

  elements.find(headingSelector).each(function (index, element) {
    if (element.innerText.indexOf(title) !== -1) {
      let node = Cypress.$(element).next();
      while (node.length !== 0) {

        // Exit condition also includes nested siblings that contain sections
        if (node.is(headingSelector) ||
            node.find(headingSelector).length !== 0) {
          break;
        }

        // Collect every sibling until we hit another section
        foundElements.push(...node);
        node = node.next();
      }
    }
  });

  return Cypress.$(foundElements);
});

/**
 * Return the value of the configuration row with the given name
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String} label - The contents of the label
 */
Cypress.addChildCommand('configurationMapValue', function (elements, label) {
  const foundElements = [];
  const compareLabel = label.toLowerCase();

  elements.each(function (index, element) {
    const labelElement = element.querySelector('.configuration-map-label');
    if (!labelElement) {
      return;
    }

    if (StringUtil.getContents(labelElement).toLowerCase() === compareLabel) {
      const valueElement = element.querySelector('.configuration-map-value');
      expect(valueElement).not.to.equal(null);
      foundElements.push(valueElement);
    }
  });

  return Cypress.$(foundElements);
});
