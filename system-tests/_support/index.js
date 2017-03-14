const StringUtil = require('./utils/StringUtil');

Cypress.addParentCommand('visitUrl', function (options) {
  var clusterDomain = new URL(Cypress.env('CLUSTER_URL')).host.split(':')[0];
  var url = Cypress.env('CLUSTER_URL') + '/#' + options.url;

  cy
    .setCookie('dcos-acs-auth-cookie', Cypress.env('CLUSTER_AUTH_TOKEN'), {httpOnly: true, domain: clusterDomain})
    .setCookie('dcos-acs-info-cookie', Cypress.env('CLUSTER_AUTH_INFO'), {domain: clusterDomain})
    .visit(url);
});

/**
 * Locate the input element in the form group that contains the string given
 */
Cypress.addChildCommand('getFormGroupInputFor', function (elements, label) {
  const compareLabel = label.toLowerCase();
  const formGroup = elements.find('.form-group').filter(function (index, group) {
    const groupLabel = Cypress.$(group).find('label');
    if (groupLabel.length === 0) {
      return false;
    }

    return StringUtil.getNormalizedContents(groupLabel[0]) === compareLabel;
  });

  // If nothing found, return empty selection
  expect(formGroup).not.to.equal(null);

  // If we found a form group, return the input element within
  return formGroup.find('textarea, input, select, *:not(span).form-control');
});

/**
 * Locate a table row that contains the given string and return the entire row
 */
Cypress.addChildCommand('getTableRowThatContains', function (elements, tdContains) {
  let matchedRows = elements.find('tr');

  matchedRows = matchedRows.filter(function (index, row) {
    return Array.prototype.slice.apply(row.childNodes).some(function (child) {
      return child.innerText.indexOf(tdContains) !== -1;
    });
  });

  return Cypress.$(matchedRows);
});

/**
 * Return all the <td> cells for the given column of the selected table
 */
Cypress.addChildCommand('getTableColumn', function (elements, columNameOrIndex) {
  const matchedRows = elements.find('tr');
  const headings = matchedRows.eq(0).find('th');
  let columnIndex = parseInt(columNameOrIndex);

  if (Number.isNaN(columnIndex)) {
    const compareName = String(columNameOrIndex).toLowerCase();

    // Fallback to first column
    columnIndex = 0;
    headings.each(function (index, th) {
      if (StringUtil.getNormalizedContents(th) === compareName) {
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

/**
 * Return the text contents of all the selected elements
 */
Cypress.addChildCommand('contents', function (elements) {
  return elements.map((index, element) => element.innerText).get();
});

/**
 * Extract the string from the given element (including ACE editor) and
 * check if the parsed JSON equals to the given JSON object.
 */
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

/**
 * Trigger mouse over event on the selected elements
 */
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
