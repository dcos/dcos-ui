import mixin from "reactjs-mixin";
import React from "react";

import InternalStorageMixin
  from "../../../../../src/js/mixins/InternalStorageMixin";

const MATCH_OPERATOR_RE = /[|\\{}()[\]^$+*?.]/g;

function regExpPropType(props, propName, componentName, location) {
  if (!(props[propName] instanceof RegExp)) {
    var propType = typeof props[propName];

    return new Error(
      `"Invalid ${location} '${propName}' of type '${propType}' supplied to ` +
        `'${componentName}', expected 'RegExp'.`
    );
  }
}

function escapeStringRegexp(str) {
  if (typeof str !== "string") {
    throw new TypeError("Expected a string");
  }

  return str.replace(MATCH_OPERATOR_RE, "\\$&");
}

let debounceTimeout = null;

class Highlight extends mixin(InternalStorageMixin) {
  constructor() {
    super(...arguments);
    this.count = 0;
  }

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    if (nextProps.search !== currentProps.search) {
      clearTimeout(debounceTimeout);

      const searchLength = nextProps.search.length;
      const { searchDebounceThreshold, searchDebounceDelay } = currentProps;
      if (searchLength <= searchDebounceThreshold && searchLength > 0) {
        debounceTimeout = setTimeout(() => {
          this.forceUpdate();
        }, searchDebounceDelay);

        return false;
      }
    }

    return true;
  }

  componentDidUpdate() {
    let { highlightCount } = this.internalStorage_get();
    if (!this.props.search) {
      highlightCount = 0;
    }

    this.props.onCountChange(highlightCount);
  }

  /**
   * Determine if props are valid types for processing.
   *
   * @return {Boolean} Whether children is a scalar or not
   */
  isScalar() {
    return /string|number|boolean/.test(typeof this.props.children);
  }

  /**
   * Determine if required search prop is defined and valid.
   *
   * @return {Boolean} Whether there is a requested search or not
   */
  hasSearch() {
    return typeof this.props.search !== "undefined" && this.props.search;
  }

  /**
   * Get the search prop, but always in the form of a regular expression. Use
   * this as a proxy to this.props.search for consistency.
   *
   * @return {RegExp} Gets the search as a regex
   */
  getSearch() {
    if (this.props.search instanceof RegExp) {
      return this.props.search;
    }

    let flags = "";
    if (!this.props.caseSensitive) {
      flags += "i";
    }

    let search = this.props.search;
    if (typeof this.props.search === "string") {
      search = escapeStringRegexp(search);
    }

    return new RegExp(search, flags);
  }

  /**
   * Get the indexes of the first and last characters of the matched string.
   *
   * @param  {string} subject
   *   The string to search against.
   *
   * @param  {RegExp} search
   *   The regex search query.
   *
   * @return {Object}
   *   An object consisting of 'first' and 'last' properties representing the
   *   indexes of the first and last characters of a matching string.
   */
  getMatchBoundaries(subject, search) {
    const matches = search.exec(subject);
    if (matches) {
      return {
        first: matches.index,
        last: matches.index + matches[0].length
      };
    }
  }

  /**
   * Determines which strings of text should be highlighted or not.
   *
   * @param  {string} subject
   *   The body of text that will be searched for highlighted words.
   * @param  {string} search
   *   The search used to search for highlighted words.
   *
   * @return {Array}
   *   An array of ReactElements
   */
  highlightChildren(subject, search) {
    const children = [];
    const { watching } = this.props;
    let remaining = subject;
    let highlightCount = 0;

    while (remaining) {
      if (!search.test(remaining)) {
        children.push(this.renderPlain(remaining));
        this.internalStorage_set({ highlightCount });

        return children;
      }

      const boundaries = this.getMatchBoundaries(remaining, search);

      // Capture the string that leads up to a match...
      const nonMatch = remaining.slice(0, boundaries.first);
      if (nonMatch) {
        children.push(this.renderPlain(nonMatch));
      }

      // Now, capture the matching string...
      const match = remaining.slice(boundaries.first, boundaries.last);
      if (match) {
        highlightCount++;

        if (highlightCount === watching) {
          children.push(this.renderWatchingHighlight(match));
        } else {
          children.push(this.renderHighlight(match));
        }
      }

      // And if there's anything left over, recursively run this method again.
      remaining = remaining.slice(boundaries.last);
    }

    return children;
  }

  /**
   * Responsible for rending a non-highlighted element.
   *
   * @param  {string} string
   *   A string value to wrap an element around.
   *
   * @return {ReactElement} element to render, when there is not a match
   */
  renderPlain(string) {
    this.count++;

    return (
      <span key={this.count}>
        {string}
      </span>
    );
  }

  /**
   * A wrapper to the highlight method to determine when the highlighting
   * process should occur.
   *
   * @param  {string} subject
   *   The body of text that will be searched for highlighted words.
   *
   * @return {Array}
   *   An array of ReactElements
   */
  renderElement(subject) {
    if (this.isScalar() && this.hasSearch()) {
      return this.highlightChildren(subject, this.getSearch());
    }

    return this.props.children;
  }

  /**
   * Responsible for rending a highlighted element.
   *
   * @param  {string} string
   *   A string value to wrap an element around.
   *
   * @return {ReactElement} element to render, when highlighted
   */
  renderHighlight(string) {
    this.count++;

    return React.createElement(
      this.props.matchElement,
      { key: this.count, className: this.props.matchClass },
      string
    );
  }

  renderWatchingHighlight(string) {
    this.count++;

    return (
      <this.props.matchElement
        className={this.props.selectedMatchClass}
        key={this.count}
      >
        {string}
      </this.props.matchElement>
    );
  }

  render() {
    return (
      <div {...this.props}>
        {this.renderElement(this.props.children)}
      </div>
    );
  }
}

Highlight.defaultProps = {
  caseSensitive: false,
  matchElement: "strong",
  matchClass: "highlight",
  searchDebounceDelay: 500,
  searchDebounceThreshold: 2,
  selectedMatchClass: "highlight selected"
};

Highlight.propTypes = {
  search: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
    React.PropTypes.bool,
    regExpPropType
  ]).isRequired,
  caseSensitive: React.PropTypes.bool,
  matchElement: React.PropTypes.string,
  matchClass: React.PropTypes.string,
  searchDebounceDelay: React.PropTypes.number,
  searchDebounceThreshold: React.PropTypes.number,
  selectedMatchClass: React.PropTypes.string,
  watching: React.PropTypes.number
};

module.exports = Highlight;
