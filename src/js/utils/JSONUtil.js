/**
 * Tokenizer regular expressions
 */
const TOKENIZER_TOKENS = {
  comma: /,/g,
  "end-label": /:/g,
  "begin-object": /\{/g,
  "end-object": /\}/g,
  "begin-array": /\[/g,
  "end-array": /\]/g,
  string: /"(\\["\\/bfnrtu"]|[^"\\"])*"/g,
  null: /null/g,
  boolean: /(true|false)/g,
  number: /-?\d+(\.\d+)?([eE]-?\d+)?/g,
  symbol: /\w+/g
};

// Extract only keys
const TOKENIZER_NAMES = Object.keys(TOKENIZER_TOKENS);

/**
 * Return the next JSON token from the given string
 *
 * @param {string} chunk - The source payload
 * @param {number} offset - The offset to start searching from
 * @returns {array} - Returns an array with [ name, match, offset ]
 */
function nextJSONToken(chunk, offset) {
  let i = 0;
  let lastName = "";
  let lastMatch = "";
  let lastOffset = chunk.length;
  const tokenCount = TOKENIZER_NAMES.length;

  while (i < tokenCount) {
    const tokenName = TOKENIZER_NAMES[i];
    const tokenRegExp = TOKENIZER_TOKENS[tokenName];

    // Search for a token at given offset
    tokenRegExp.lastIndex = offset;

    // If we got something closer to the last match, prefer this one
    const match = tokenRegExp.exec(chunk);
    if (match && match.index < lastOffset) {
      lastOffset = match.index;
      lastName = tokenName;
      lastMatch = match[0];
    }

    i++;
  }

  return [lastName, lastMatch, lastOffset];
}

/**
 * Count how many lines exists in the string between
 * given start and end indices.
 *
 * @param {string} src - The string to test
 * @param {number} startAt - The index to start searching for new lines (inclusive)
 * @param {number} endAt - The index to end searching for new lines (exclusive)
 * @returns {number} - The number of new line characters found
 */
function countNewLines(src, startAt, endAt) {
  let newLines = 0;
  for (let i = startAt; i < endAt; i++) {
    if (src[i] === "\n") {
      newLines++;
    }
  }

  return newLines;
}

/**
 * This utility class provides useful functions for
 * analyzing a JSON source from the ACE editor or other
 * JSON sources.
 */
module.exports = {
  /**
   * Returns the JSON object on the specified line
   *
   * @param {array} objectInfo - The output of `getObjectInformation`
   * @param {number} line - The line to locate
   * @returns {object} - The related object on the given line or null
   */
  getObjectOnLine(objectInfo, line) {
    return objectInfo.find(function(info) {
      return info.line === line;
    });
  },

  /**
   * Process JSON source and return detailed information for every object
   * in the object. The information processed for every token is:
   *
   * {
   *   path: [ 'path', 'in', 'the', 'object' ],
   *   line: 0,
   *   type: 'object|array|literal',
   *  [value]: 'literal value'
   * }
   *
   * @param {string} source - The source code to parse
   * @returns {array} - An array with the objects in the JSON
   */
  getObjectInformation(source) {
    const keyLines = [];
    // Keeps track of the current line number
    let lineNo = 1;
    // The current path in the object trace
    const path = [];
    // Keeps track of last literal (number, string, null, boolean)
    let lastLiteral;
    // This variable is used only when the parser is within an array [ ],
    // pointing to the current array index. Otherwise it's -1
    let arrayIndex = -1;
    // This variable keeps track of the current object key. It's used only
    // when in an object { } and is populated only when a colon ':'' is encountered
    let objectKey = null;
    // Stack of block tokens, used to keep track of the last opened block
    // token in order to update the ending position.
    const blockTokens = [];

    // First validate sanity of the JSON source, in order for us
    // to safely assume that this is a legit JSON source
    // (This will throw an exception)
    JSON.parse(source);

    // Process tokens
    let i = 0;
    const sourceLength = source.length;
    while (i < sourceLength) {
      // Get next token or exit if there are no more
      let [token, match, offset] = nextJSONToken(source, i);
      if (!token) {
        break;
      }

      // Count how many new lines we encountered since the
      // last index and forward line number accordingly
      const curr = i;
      i = offset + match.length;
      lineNo += countNewLines(source, curr, i);

      // Process token
      switch (token) {
        //
        // The last literal before '{' is the object name.
        // This action should add a level in the path
        //
        case "begin-object":
          // Keep track of keyed objects
          if (objectKey) {
            const blockToken = {
              path: [].concat(path, objectKey),
              line: lineNo,
              type: "object",
              position: [offset, i]
            };

            keyLines.push(blockToken);
            blockTokens.push(blockToken);

            path.push(objectKey);
            objectKey = null;
          }

          // Keep track of indexed objects
          if (arrayIndex !== -1) {
            const blockToken = {
              path: [].concat(path, arrayIndex),
              line: lineNo,
              type: "object",
              position: [offset, i]
            };

            keyLines.push(blockToken);
            blockTokens.push(blockToken);

            path.push(arrayIndex);
          }

          // Wipe array index
          arrayIndex = -1;
          break;
        //
        // When we start an array, push a numeric component on path
        //
        case "begin-array":
          // Keep track of keyed arrays
          if (objectKey) {
            const blockToken = {
              path: [].concat(path, objectKey),
              line: lineNo,
              type: "array",
              position: [offset, i]
            };

            keyLines.push(blockToken);
            blockTokens.push(blockToken);

            path.push(objectKey);
            objectKey = null;
          }

          // Keep track of indexed arrays
          if (arrayIndex !== -1) {
            const blockToken = {
              path: [].concat(path, arrayIndex),
              line: lineNo,
              type: "array",
              position: [offset, i]
            };

            keyLines.push(blockToken);
            blockTokens.push(blockToken);

            path.push(arrayIndex);
          }

          // Start array index
          arrayIndex = 0;
          break;
        //
        // When objects or arrays are ended, pop the last item
        // and keep track of the array information
        //
        case "end-object":
        case "end-array":
          // Pop path and resume possible array tracking
          const lastValue = path.pop();
          if (typeof lastValue === "number") {
            arrayIndex = lastValue;
          } else {
            arrayIndex = -1;
          }

          // Update the ending position of the last block token on stack
          const lastBlockToken = blockTokens.pop();
          if (lastBlockToken) {
            lastBlockToken.position[1] = i;
          }
          break;
        //
        // A comma is handled only if we have an open array
        // on the last path component. It should advance the
        // index by one.
        //
        case "comma":
          // Advance array index
          if (arrayIndex !== -1) {
            arrayIndex++;
          }
          break;
        //
        // The moment we find a label ':', the last literal
        // is the key to a property. Keep track of it in the path.
        //
        case "end-label":
          // Label after a literal defines an object key
          if (lastLiteral) {
            objectKey = lastLiteral;
          }
          break;
        //
        // String literals include their quotes,
        // everything else is kept as-is
        //
        case "string":
          match = match.slice(1, -1);
        /* eslint-disable no-fallthrough */
        case "maybe-string":
        case "number":
        case "boolean":
        case "null":
          /* eslint-enable no-fallthrough */

          // Cast tokens to their correct type
          if (token === "number") {
            match = Number(match);
          } else if (token === "boolean") {
            match = match === "true";
          } else if (token === "null") {
            match = null;
          }

          // Keep last literal
          lastLiteral = match;

          // Keep track of keyed literals
          if (objectKey) {
            keyLines.push({
              path: [].concat(path, objectKey),
              line: lineNo,
              value: match,
              type: "literal",
              position: [offset, i]
            });
            objectKey = null;
          }

          // Keep track of indexed literals
          if (arrayIndex !== -1) {
            keyLines.push({
              path: [].concat(path, arrayIndex),
              line: lineNo,
              value: match,
              type: "literal",
              position: [offset, i]
            });
          }
          break;
      }
    }

    // Return the key line numbers
    return keyLines;
  }
};
