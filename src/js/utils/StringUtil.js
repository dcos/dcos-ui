import marked from 'marked';

const StringUtil = {
  arrayToJoinedString: function (array=[], separator = ', ') {
    if (Array.isArray(array)) {
      return array.join(separator);
    }

    return '';
  },

  filterByString: function (objects, getter, searchString) {
    var regex = StringUtil.escapeForRegExp(searchString);
    var searchPattern = new RegExp(regex, 'i');

    if (typeof getter === 'function') {
      return objects.filter(function (obj) {
        return searchPattern.test(getter(obj));
      });
    }

    return objects.filter(function (obj) {
      return searchPattern.test(obj[getter]);
    });
  },

  escapeForRegExp: function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  },

  isUrl: function (str) {
    return !!str && /^https?:\/\/.+/.test(str);
  },

  isEmail: function (str) {
    // https://news.ycombinator.com/item?id=8360786
    return !!str &&
      str.length > 3 &&
      str.indexOf('@') !== -1 &&
      str.indexOf('.') !== -1;
  },

  pluralize: function (string, arity) {
    if (arity == null) {
      arity = 2;
    }

    if (string.length === 0) {
      return '';
    }

    arity = parseInt(arity, 10);

    if (arity !== 1) {
      string = string.replace(/y$/, 'ie') + 's';
    }

    return string;
  },

  capitalize: function (string) {
    if (typeof string !== 'string') {
      return null;
    }

    return string.charAt(0).toUpperCase() + string.slice(1, string.length);
  },

  humanizeArray: function (array, serialComma=true) {
    let length = array.length;
    if (length === 0) {
      return '';
    }
    if (length === 1) {
      return array[0];
    }
    if (length === 2) {
      return array.join(' and ');
    }
    let head = array.slice(0, -1);
    let tail = array.slice(-1)[0];
    let conjunction = serialComma ? ', and ' : ' and ';
    return head.join(', ') + conjunction + tail;
  },

  parseMarkdown(text) {
    if (!text) {
      return null;
    }

    let __html = marked(
      // Remove any tabs, that will create code blocks
      text.replace('\t', ' '),
      {gfm: true, tables: false, sanitize: true}
    );

    if (!__html) {
      return null;
    }

    return {__html};
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
  idToTitle: function (id, splitBy=[], replace={}, removeConsecutive) {

    if (splitBy.length === 0) {
      return id.reduce((title, word, i, words) => {
        if (removeConsecutive && (i > 0) && (word === words[i - 1])) {
          return title;
        }
        word = replace[word] || this.capitalize(word.toLowerCase().trim());
        return `${title} ${word}`;
      }, '').trim();
    }

    let splitID = id.reduce(function (accumulated, element) {
      let splitWords = element.split(splitBy.shift());

      splitWords.map(function (token) {
        accumulated.push(token);
      });
      return accumulated;
    }, []);

    return this.idToTitle(splitID, splitBy, replace, removeConsecutive);
  }
};

module.exports = StringUtil;
