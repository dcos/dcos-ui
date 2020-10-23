const toLowerWithoutSpace = (s) => s.replace(/\s/g, "").toLowerCase();
const eq = (s1, s2) => toLowerWithoutSpace(s1) === toLowerWithoutSpace(s2);
const getContents = (element) =>
  element.innerText.replace(/[\r\n\s+]+/g, " ").trim();

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
