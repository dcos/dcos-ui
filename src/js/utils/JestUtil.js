import TestUtils from "react-addons-test-utils";
import React from "react";
import ReactDOM from "react-dom";
import { routerShape } from "react-router";

const stores = {
  CosmosPackagesStore: "../stores/CosmosPackagesStore",
  MesosStateStore: "../stores/MesosStateStore",
  MesosSummaryStore: "../stores/MesosSummaryStore",
  MetadataStore: "../stores/MetadataStore"
};

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

const JestUtil = {
  renderAndFindTag(instance, tag) {
    var result = TestUtils.renderIntoDocument(instance);

    return TestUtils.findRenderedDOMComponentWithTag(result, tag);
  },

  unMockStores(storeIDs) {
    Object.keys(stores).forEach(function(storeID) {
      if (storeIDs.indexOf(storeID) === -1) {
        jest.setMock(stores[storeID], {});
      }
    });
  },

  dontMockStore(storeID) {
    if (storeID in stores) {
      jest.dontMock(stores[storeID]);

      return true;
    }
  },
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
   * This function will mock Date.getTimezoneOffset and Date.toLocaleString
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
    /* eslint-enable no-extend-native */
  },

  /**
   * Helper to stub router context, based on
   * https://github.com/reactjs/react-router/blob/0.13.x/docs/guides/testing.md
   * @param {React.Component} Component
   * @param {object} [props]
   * @param {object} [routerStubs]
   * @param {object} [contextTypes]
   * @param {object} [context]
   * @returns {React.Element} wrapped component element
   */
  stubRouterContext(
    Component,
    props = {},
    routerStubs = {},
    contextTypes = {},
    context = {}
  ) {
    // Create wrapper component
    class WrappedComponent extends React.Component {
      static get childContextTypes() {
        return Object.assign(
          {
            router: routerShape,
            routeDepth: React.PropTypes.number
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
        return <Component {...props} />;
      }
    }

    return React.createElement(WrappedComponent);
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
   * Helper to render component with stubbed router and getting original
   * rendered component, not the WrappedComponent returned by stubRouterContext
   * @param {React.Component} Component to render
   * @param  {Object} [props] properties to pass to the component to render
   * @param  {DOMElement} container element to render component into
   * @param  {Object} [routerStubs]
   * @return {React.Element} rendered into container
   */
  renderWithStubbedRouter(Component, props, container, routerStubs = {}) {
    return TestUtils.findRenderedComponentWithType(
      ReactDOM.render(
        this.stubRouterContext(Component, props, routerStubs),
        container
      ),
      Component
    );
  },

  /**
   * Restore the original version of the Date prototype functions, overwritten
   * by the mockTimezone function.
   */
  unmockTimezone() {
    /* eslint-disable no-extend-native */
    Date.prototype.getTimezoneOffset = defaultGetTimezoneOffset;
    Date.prototype.toLocaleString = defaultToLocaleString;
    /* eslint-enable no-extend-native */
  }
};

module.exports = JestUtil;
