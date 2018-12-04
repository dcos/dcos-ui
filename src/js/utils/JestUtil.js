import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { I18nProvider } from "@lingui/react";

import en from "#LOCALE/en/messages.js";

// Private router stub
const RouterStub = {
  push() {},
  replace() {},
  go() {},
  goBack() {},
  goForward() {},
  setRouteLeaveHook() {},
  createPath() {},
  createHref() {},
  isActive() {}
};

// Default prototype functions when mocking timezone
const defaultGetTimezoneOffset = Date.prototype.getTimezoneOffset;
const defaultToLocaleString = Date.prototype.toLocaleString;
const defaultDateTimeFormat = Intl.DateTimeFormat;

const JestUtil = {
  /**
   * Generates a callback function to a filter() call that will
   * keep only DOMElements matching the given tag name(s)
   *
   * @example <caption>How to use filterByTagName</caption>
   * const TestUtils = require('react-addons-test-utils');
   *
   * var componentInstance = TestUtils.renderIntoDocument(
   *   <MyTableComponent />
   * );
   *
   * var nameTDs = TestUtils.scryRenderedDOMComponentsWithClass(
   *   componentInstance, 'table-column-name'
   * ).filter(filterByTagName('TD'));
   *
   * @param {array|string} tag - One or mor tagNames to match
   * @returns {function} Returns a callback function to be passed on .filter()
   */
  filterByTagName(tag) {
    if (!Array.isArray(tag)) {
      tag = [tag];
    }

    return function(element) {
      return tag.some(function(tagName) {
        return element.tagName === tagName;
      });
    };
  },

  /**
   * Helper callback function to be used when you want the text contents
   * of an array of DOMElements.
   *
   * @example <caption>How to use mapTextContent</caption>
   * const TestUtils = require('react-addons-test-utils');
   *
   * var componentInstance = TestUtils.renderIntoDocument(
   *   <MyTableComponent />
   * );
   *
   * var nameTDContents = TestUtils.scryRenderedDOMComponentsWithClass(
   *   componentInstance,
   *   'table-column-name'
   * ).map(mapTextContent);
   *
   * @param {DOMElement} element - The DOM element for which to get the content
   * @returns {string} The text content
   */
  mapTextContent(element) {
    return element.textContent.trim();
  },

  /**
   * Mock a different timezone by overriding relevant Date primitive
   * prototype functions.
   *
   * This function will mock Date.getTimezoneOffset, Date.toLocaleString and Intl.DateTimeFormat
   *
   * @param {String} timezone - The IANA timezone string (ex. Europe/Athens) or 'UTC'
   */
  mockTimezone(timezone) {
    const date = new Date();
    const timezoneOffset =
      (new Date(date.toLocaleString(undefined, { timeZone: "UTC" })) -
        new Date(date.toLocaleString(undefined, { timeZone: timezone }))) /
      1000 /
      60;

    /* eslint-disable no-extend-native */
    Date.prototype.getTimezoneOffset = function() {
      return timezoneOffset;
    };
    Date.prototype.toLocaleString = function(locale = undefined, options = {}) {
      options.timeZone = options.timeZone || timezone;

      return defaultToLocaleString.call(this, locale, options);
    };
    Intl.DateTimeFormat = function(locales, options) {
      options.timeZone = options.timeZone || timezone;

      return defaultDateTimeFormat.call(this, locales, options);
    };
    /* eslint-enable no-extend-native */
  },

  /**
   * Helper to stub router context, based on
   * https://github.com/reactjs/react-router/blob/0.13.x/docs/guides/testing.md
   * @param {React.Component} Component
   * @param {object} [routerStubs]
   * @param {object} [contextTypes]
   * @param {object} [context]
   * @returns {React.Element} wrapped component element
   */
  stubRouterContext(
    Component,
    routerStubs = {},
    contextTypes = {},
    context = {}
  ) {
    // Create wrapper component
    return class WrappedComponent extends React.Component {
      static get childContextTypes() {
        return Object.assign(
          {
            router: routerShape,
            routeDepth: PropTypes.number
          },
          contextTypes
        );
      }

      getChildContext() {
        return Object.assign(
          {
            router: Object.assign(RouterStub, routerStubs),
            routeDepth: 0
          },
          context
        );
      }

      render() {
        return <Component {...this.props} />;
      }
    };
  },

  withI18nProvider(Component, catalogs = { en }) {
    // eslint-disable-next-line react/no-multi-comp
    return class WrappedComponent extends React.Component {
      render() {
        return (
          <I18nProvider defaultRender="span" language="en" catalogs={catalogs}>
            <Component {...this.props} />
          </I18nProvider>
        );
      }
    };
  },

  /**
   * Generates a callback function to a reduce() call that will
   * find and return the textContent of DOM element(s) matching
   * the given selector
   *
   * @example <caption>How to use reduceTextContentOfSelector</caption>
   * const TestUtils = require('react-addons-test-utils');
   *
   * var componentInstance = TestUtils.renderIntoDocument(
   *   <MyTableComponent />
   * );
   *
   * var names = TestUtils.scryRenderedDOMComponentsWithClass(
   *   componentInstance,
   *   'table-column-name'
   * ).reduce(
   *   reduceTextContentOfSelector('.collapsing-string-full-string'),
   *   []
   * );
   *
   * @param {string} selector - The CSS selector to match children
   * @returns {function} Returns a callback function to be passed on .reduce()
   */
  reduceTextContentOfSelector(selector) {
    return function(strings, element) {
      const matchedElements = Array.from(element.querySelectorAll(selector));

      matchedElements.forEach(function(stringElement) {
        strings.push(stringElement.textContent);
      });

      return strings;
    };
  },

  /**
   * Restore the original version of the Date prototype functions, overwritten
   * by the mockTimezone function.
   */
  unmockTimezone() {
    /* eslint-disable no-extend-native */
    Date.prototype.getTimezoneOffset = defaultGetTimezoneOffset;
    Date.prototype.toLocaleString = defaultToLocaleString;
    Intl.DateTimeFormat = defaultDateTimeFormat;
    /* eslint-enable no-extend-native */
  }
};

module.exports = JestUtil;
