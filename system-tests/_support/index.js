const StringUtil = require("./utils/StringUtil");
const { Timeouts } = require("./constants");

/**
 * Visit the specified (Routed) URL
 *
 * This function will automatically inject the authentication cookies from the
 * environment variables and visit the correct cluster URL.
 *
 * @param {String} visitUrl - The URL to visit
 */
Cypress.Commands.add("visitUrl", { prevSubject: false }, function(visitUrl) {
  var clusterDomain = new URL(Cypress.env("CLUSTER_URL")).host.split(":")[0];
  var url = Cypress.env("CLUSTER_URL") + "/#" + visitUrl;

  cy
    .setCookie("dcos-acs-auth-cookie", Cypress.env("CLUSTER_AUTH_TOKEN"), {
      httpOnly: true,
      domain: clusterDomain
    })
    .setCookie("dcos-acs-info-cookie", Cypress.env("CLUSTER_AUTH_INFO"), {
      domain: clusterDomain
    })
    .visit(url);
});

/**
 * Select the input element of the form group with the given label
 *
 * NOTE: This function ignores case and removes extraneous whitespaces, yet
 *       it performs a complete label match.
 *
 * This utility is used for selecting form elements by their visual name instead
 * of using a more specific CSS selector.
 *
 * This detects DOM structures like:
 *
 * <div class="form-group">
 *   <div ...
 *     <label>Track Name</label>
 *   </div>
 *   <div ...
 *     <input />    # .. or
 *     <select />   # .. or
 *     <textarea /> # .. or
 *     <div class="form-control" />
 *   </div>
 * </div>
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String} label - The contents of the <label> to match
 */
Cypress.Commands.add("getFormGroupInputFor", { prevSubject: true }, function(
  elements,
  label
) {
  const compareLabel = label.toLowerCase();
  const formGroup = elements.find(".form-group").filter(function(index, group) {
    const groupLabel = Cypress.$(group).find("label");
    if (groupLabel.length === 0) {
      return false;
    }

    return StringUtil.getContents(groupLabel[0]).toLowerCase() === compareLabel;
  });

  // If nothing found, return empty selection
  expect(formGroup).not.to.equal(null);

  // If we found a form group, return the input element within
  // (Note: <span class="form control"> is used to wrap <select>s)
  return formGroup.find("textarea, input, select, *:not(span).form-control");
});

/**
 * Locate a table row that contains the given string and return the entire row
 *
 * This function searches all the <tr /> elements within the current scope and
 * checks if it contains the string given. If matched, the scope is filtered
 * to the <tr /> element(s) found.
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String} contents - The contents of the <td /> to search
 */
Cypress.Commands.add("getTableRowThatContains", { prevSubject: true }, function(
  elements,
  contents
) {
  let matchedRows = elements.find("tr");

  matchedRows = matchedRows.filter(function(index, row) {
    return Array.prototype.slice.apply(row.childNodes).some(function(child) {
      return child.innerText.indexOf(contents) !== -1;
    });
  });

  return Cypress.$(matchedRows);
});

/**
 * Return all the <td> cells for the given column of the table
 *
 * This function collects all the <td /> cells for the given column (addressed
 * either by it's index, or by it's <th> contents).
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String|Number} columNameOrIndex - The table index or the <th /> contents
 */
Cypress.Commands.add("getTableColumn", { prevSubject: true }, function(
  elements,
  columNameOrIndex
) {
  const matchedRows = elements.find("tr");
  const headings = matchedRows.eq(0).find("th");
  let columnIndex = parseInt(columNameOrIndex, 10);

  if (Number.isNaN(columnIndex)) {
    const compareName = String(columNameOrIndex).toLowerCase();

    // Fallback to first column
    columnIndex = 0;
    headings.each(function(index, th) {
      if (StringUtil.getContents(th).toLowerCase() === compareName) {
        columnIndex = index;
      }
    });
  }

  // Collect all visible rows
  return matchedRows
    .slice(1)
    .filter(function(index, element) {
      return element.style.display !== "none";
    })
    .map(function(index, element) {
      return element.querySelectorAll("td")[columnIndex];
    });
});

/**
 * Return the text contents of all the selected elements
 *
 * This function will return an array with the text contents of every element
 * in the context. This function extracts the contents like so:
 *
 * - .ace_editor : Uses ACE Editor API to get contents
 * - input       : Returns the value property
 * - *           : Returns the innerText value
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 */
Cypress.Commands.add("contents", { prevSubject: true }, function(elements) {
  return elements
    .map(function(index, element) {
      const doc = element.ownerDocument;
      const win = doc.defaultView || doc.parentWindow;

      if (element.classList.contains("ace_editor")) {
        return win.ace.edit(element.id).getValue();
      } else if (element.value !== undefined) {
        return element.value;
      } else {
        return element.innerText;
      }
    })
    .get();
});

/**
 * Sets given JSONString as value for ACE Editor
 *
 * This function will set the given text as value for ACE Editor
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String} JSONString - JSON Code as String
 */
Cypress.Commands.add("setJSON", { prevSubject: true }, function(
  elements,
  JSONString
) {
  if (elements.length != null && JSONString) {
    elements.each(function(index, element) {
      const doc = element.ownerDocument;
      const win = doc.defaultView || doc.parentWindow;
      if (win.ace) {
        win.ace.edit(element.id).setValue(JSONString);
      }
    });
  }
});

/**
 * Convert the strings in scope into a JSON object
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 */
Cypress.Commands.add("asJson", { prevSubject: true }, function(contents) {
  if (contents.length != null) {
    return contents.map(function(content) {
      return JSON.parse(content);
    });
  } else {
    return JSON.parse(contents);
  }
});

/**
 * Checks that a service id abides by format: /<test-UUID>/service-name
 *
 * @param {String} id - serviceId to validate
 *
 */
function validateServiceId(id) {
  if (!id.startsWith("/")) {
    throw new Error("Must include leading slash in service id");
  }
  const idParts = id.split("/");
  if (idParts[1] !== Cypress.env("TEST_UUID")) {
    throw new Error("Service must be in the TEST_UUID group");
  }
  if (idParts.length !== 3) {
    throw new Error("Must deploy service directly in TEST_UUID group");
  }
}

/**
 * Launches a new service using the dcos CLI. Service must be created
 * directly in the TEST_UUID group. Ex: /<TEST-UUID>/test-service
 *
 * @param {Object} serviceDefinition - The service JSON definition file
 *
 */
export function createService(serviceDefinition) {
  validateServiceId(serviceDefinition.id);
  const serviceName = serviceDefinition.id.split("/").pop();

  cy.exec(
    `echo '${JSON.stringify(serviceDefinition)}' | dcos marathon app add`
  );
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
  cy
    .get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
    .contains(serviceName, {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
    .should("exist");
  cy
    .get(".page-body-content table")
    .getTableRowThatContains(serviceName)
    .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
    .should("exist");
}

/**
 * Deletes a service from group TEST_UUID using the dcos CLI.
 *
 * @param {String} serviceId - The service id which it will delete
 *
 */
export function deleteService(serviceId) {
  validateServiceId(serviceId);
  const serviceName = serviceId.split("/").pop();

  cy.exec(`dcos marathon app remove ${serviceId}`);
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
  cy.get(".page-body-content table").contains(serviceName).should("not.exist");
}
