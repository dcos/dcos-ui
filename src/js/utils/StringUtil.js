import marked from "marked";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import search from "./search";

const markdownRenderer = {
  rendererReady: false,
  prepareMarkdownRenderer() {
    const renderer = new marked.Renderer();
    renderer.link = function() {
      const out = marked.Renderer.prototype.link.apply(this, arguments);

      return out.replace(/^<a/, '<a target="_blank"');
    };
    marked.setOptions({ renderer });
    this.rendererReady = true;
  }
};

const StringUtil = {
  arrayToJoinedString(array = [], separator = ", ") {
    if (Array.isArray(array)) {
      return array.join(separator);
    }

    return "";
  },

  /**
   * Filters and sorts an array of objects according to a property/getter func
   *
   * @param {array} objects
   * @param {mixed} property
   * @param {string} searchString
   * @return {array} filtered objects
   */
  filterByString(objects, property, searchString) {
    const extractor =
      typeof property === "function"
        ? property
        : obj => [].concat(obj[property]);

    return search(searchString, objects, extractor).map(
      scoredObject => scoredObject.obj
    );
  },

  escapeForRegExp(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
  },

  isUrl(str) {
    return !!str && /^https?:\/\/.+/.test(str);
  },

  isEmail(str) {
    // https://news.ycombinator.com/item?id=8360786
    return (
      !!str &&
      str.length > 3 &&
      str.indexOf("@") !== -1 &&
      str.indexOf(".") !== -1
    );
  },

  pluralize(string, arity) {
    if (arity == null) {
      arity = 2;
    }

    if (string.length === 0) {
      return "";
    }

    arity = parseInt(arity, 10);

    if (arity !== 1) {
      string = string.replace(/y$/, "ie") + "s";
    }

    return string;
  },

  punctuate(string) {
    if (typeof string !== "string") {
      return "";
    }

    if (string.trim().slice(-1) !== ".") {
      return `${string.trim()}.`;
    }

    return string;
  },

  capitalize(string) {
    if (typeof string !== "string") {
      return null;
    }

    return string.charAt(0).toUpperCase() + string.slice(1, string.length);
  },

  capitalizeEveryWord(string) {
    if (typeof string !== "string") {
      return null;
    }

    return string
      .toLowerCase()
      .split(/[_-]/)
      .map(word => this.capitalize(word))
      .join(" ");
  },

  lowercase(string) {
    if (typeof string !== "string") {
      return null;
    }

    return string.charAt(0).toLowerCase() + string.slice(1, string.length);
  },

  humanizeArray(array, options) {
    options = Object.assign(
      {
        serialComma: true,
        wrapValueFunction: false
      },
      options
    );

    const length = array.length;
    let conjunction = " and ";

    if (length === 0) {
      return "";
    }

    if (length === 1) {
      if (options.wrapValueFunction) {
        return options.wrapValueFunction(array[0], 0);
      } else {
        return array[0];
      }
    }

    if (length === 2) {
      if (options.wrapValueFunction) {
        return [
          options.wrapValueFunction(array[0], 0),
          conjunction,
          options.wrapValueFunction(array[1], 1)
        ];
      } else {
        return array.join(conjunction);
      }
    }

    const head = array.slice(0, -1);
    const tail = array.slice(-1)[0];
    if (options.serialComma) {
      conjunction = ", and ";
    }

    if (options.wrapValueFunction) {
      const jsx = head.reduce(function(memo, value, index) {
        memo.push(options.wrapValueFunction(value, index));

        if (index !== head.length - 1) {
          memo.push(", ");
        }

        return memo;
      }, []);

      jsx.push(conjunction);
      jsx.push(options.wrapValueFunction(tail, "tail"));

      return jsx;
    } else {
      return head.join(", ") + conjunction + tail;
    }
  },

  parseMarkdown(text) {
    if (!text) {
      return null;
    }

    if (!markdownRenderer.rendererReady) {
      markdownRenderer.prepareMarkdownRenderer();
    }

    const __html = marked(
      // Remove any tabs, that will create code blocks
      text.replace("\t", " "),
      { gfm: true, tables: false, sanitize: true }
    );

    if (!__html) {
      return null;
    }

    return { __html };
  },

  /**
   * @param {Array} id       - An array that, when concatenated, represents an ID.
   * @param {Array} splitBy  - Tokens to split id by.
   * @param {Object} replace - Keys are words to replace, with value of the word
   *                           to replace with.
   * @param {Boolean} removeConsecutive
   *                         - Whether or not to remove consecutive duplicate
   *                           word tokens.
   * @return {String}        - Human-readable title.
   */
  idToTitle(id, splitBy = [], replace = {}, removeConsecutive) {
    if (splitBy.length === 0) {
      return id
        .reduce((title, word, i, words) => {
          if (removeConsecutive && i > 0 && word === words[i - 1]) {
            return title;
          }
          word = replace[word] || this.capitalize(word.toLowerCase().trim());

          return `${title} ${word}`;
        }, "")
        .trim();
    }

    const splitID = id.reduce(function(accumulated, element) {
      const splitWords = element.split(splitBy.shift());

      splitWords.map(function(token) {
        accumulated.push(token);
      });

      return accumulated;
    }, []);

    return this.idToTitle(splitID, splitBy, replace, removeConsecutive);
  }
};

module.exports = StringUtil;
