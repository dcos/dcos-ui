Cypress.addParentCommand('visitUrl', function (options) {
  var clusterDomain = new URL(Cypress.env('CLUSTER_URL')).host.split(':')[0];
  var url = Cypress.env('CLUSTER_URL') + '/#' + options.url;

  cy
    .setCookie('dcos-acs-auth-cookie', Cypress.env('CLUSTER_AUTH_TOKEN'), {httpOnly: true, domain: clusterDomain})
    .setCookie('dcos-acs-info-cookie', Cypress.env('CLUSTER_AUTH_INFO'), {domain: clusterDomain})
    .visit(url);
});

/**
 * Return a configuration section
 *
 * Such section consists of all the sibling elements after an element
 * with a `configuration-map-heading` that contains the text given.
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
 */
Cypress.addChildCommand('configurationMapValue', function (elements, label) {
  const foundElements = [];
  const compareLabel = label.toLowerCase();

  elements.each(function (index, element) {
    const labelElement = element.querySelector('.configuration-map-label');
    if (!labelElement) {
      return;
    }

    if (labelElement.innerText.trim().toLowerCase() === compareLabel) {
      const valueElement = element.querySelector('.configuration-map-value');
      expect(valueElement).not.to.equal(null);
      foundElements.push(valueElement);
    }
  });

  return Cypress.$(foundElements);
});

Cypress.addChildCommand('getTableRowThatContains', function (elements, tdContains) {
  let matchedRows = elements.find('tr');

  matchedRows = matchedRows.filter(function (index, row) {
    return Array.prototype.slice.apply(row.childNodes).some(function (child) {
      return child.innerText.indexOf(tdContains) !== -1;
    });
  });

  return Cypress.$(matchedRows);
});

Cypress.addChildCommand('getTableColumn', function (elements, columNameOrIndex) {
  const matchedRows = elements.find('tr');
  const headings = matchedRows.eq(0).find('th');
  let columnIndex = parseInt(columNameOrIndex);

  if (Number.isNaN(columnIndex)) {
    const compareName = String(columNameOrIndex).toLowerCase();

    // Fallback to first column
    columnIndex = 0;
    headings.each(function (index, th) {
      if (th.innerText.trim().toLowerCase() === compareName) {
        columnIndex = index;
      }
    });
  }

  // Collect all visible rows
  return matchedRows
    .slice(1)
    .filter(function (index, element) {
      return Cypress.$(element).is(':visible');
    })
    .map(function (index, element) {
      return element.querySelectorAll('td')[columnIndex];
    });
});

Cypress.addChildCommand('contents', function (elements) {
  return elements.map((index, element) => element.innerText).get();
});

Cypress.addChildCommand('shouldJsonMatch', function (elements, json) {
  cy.window().then(function (window) {
    elements.each(function (index, element) {
      let value = '';

      if (element.classList.contains('ace_editor')) {
        value = window.ace.edit('brace-editor').getValue();
      } else if (element.value !== undefined) {
        value = element.value;
      } else {
        value = element.innerText;
      }

      expect(JSON.parse(value)).to.deep.equal(json);
    });
  });
});

Cypress.addChildCommand('triggerHover', function (elements) {
  elements.each(function (index, element) {
    fireEvent(element, 'mouseover');
  });

  function fireEvent(element, event) {
    if (element.fireEvent) {
      element.fireEvent('on' + event);
    } else {
      var evObj = document.createEvent('Events');

      evObj.initEvent(event, true, false);

      element.dispatchEvent(evObj);
    }
  }
});
