const getContents = (element) =>
  element.innerText.replace(/[\r\n\s+]+/g, " ").trim();
const toLowerWithoutSpace = (s) => s.replace(/\s/g, "").toLowerCase();
const eq = (s1, s2) => toLowerWithoutSpace(s1) === toLowerWithoutSpace(s2);

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
Cypress.Commands.add("getFormGroupInputFor", (label) =>
  cy
    .get(`.form-group label`)
    .filter((_, el) => eq(getContents(el), label))
    .closest(".form-group")
    // (Note: <span class="form control"> is used to wrap <select>s)
    .find("textarea, input, select, *:not(span).form-control")
);

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
Cypress.Commands.add(
  "getTableRowThatContains",
  { prevSubject: true },
  (elements, contents) => {
    let matchedRows = elements.find("tr");

    matchedRows = matchedRows.filter((index, row) =>
      Array.prototype.slice
        .apply(row.childNodes)
        .some((child) => child.innerText.indexOf(contents) !== -1)
    );

    return Cypress.$(matchedRows);
  }
);

/**
 * Return all the <td> cells for the given column of the table
 *
 * This function collects all the <td /> cells for the given column (addressed
 * either by it's index, or by it's <th> contents).
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String|Number} columNameOrIndex - The table index or the <th /> contents
 */
Cypress.Commands.add(
  "getTableColumn",
  { prevSubject: true },
  (elements, columNameOrIndex) => {
    const matchedRows = elements.find("tr");
    const headings = matchedRows.eq(0).find("th");
    let columnIndex = parseInt(columNameOrIndex, 10);

    if (Number.isNaN(columnIndex)) {
      const compareName = String(columNameOrIndex).toLowerCase();

      // Fallback to first column
      columnIndex = 0;
      headings.each((index, th) => {
        if (getContents(th).toLowerCase() === compareName) {
          columnIndex = index;
        }
      });
    }

    // Collect all visible rows
    return matchedRows
      .slice(1)
      .filter((index, element) => element.style.display !== "none")
      .map((index, element) => element.querySelectorAll("td")[columnIndex]);
  }
);

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
Cypress.Commands.add("contents", { prevSubject: true }, (elements) =>
  elements
    .map((index, element) => {
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
    .get()
);

/**
 * Convert the strings in scope into a JSON object
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 */
Cypress.Commands.add("asJson", { prevSubject: true }, (contents) => {
  if (contents.length != null) {
    return contents.map((content) => JSON.parse(content));
  } else {
    return JSON.parse(contents);
  }
});
