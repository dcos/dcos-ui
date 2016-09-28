import TestUtils from 'react-addons-test-utils';
import React from 'react';
import ReactDOM from 'react-dom';

let stores = {
  CosmosPackagesStore: '../stores/CosmosPackagesStore',
  MesosStateStore: '../stores/MesosStateStore',
  MesosSummaryStore: '../stores/MesosSummaryStore',
  MetadataStore: '../stores/MetadataStore'
};

// Private router stub
class RouterStub {
  static makePath() {}
  static makeHref() {}
  static transitionTo() {}
  static replaceWith() {}
  static goBack() {}
  static getCurrentPath() {}
  static getCurrentRoutes() {}
  static getCurrentPathname() {}
  static getCurrentParams() { return {}; }
  static getCurrentQuery() { return {}; }
  static getLocation() {}
  static isActive() {}
  static getRouteAtDepth() {}
  static setRouteComponentAtDepth() {}
  static setRouteComponentAtDepth() {}
}

const JestUtil = {
  renderAndFindTag(instance, tag) {
    var result = TestUtils.renderIntoDocument(instance);
    return TestUtils.findRenderedDOMComponentWithTag(result, tag);
  },

  unMockStores(storeIDs) {
    Object.keys(stores).forEach(function (storeID) {
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

    return function (element) {
      return tag.some(function (tagName) {
        return (element.tagName === tagName);
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
   * @param {DOMElement} element - The DOM element for which to get the contnet
   * @returns {string} The text content
   */
  mapTextContent(element) {
    return element.textContent;
  },

  /**
   * Helper to stub router context, based on
   * https://github.com/reactjs/react-router/blob/0.13.x/docs/guides/testing.md
   * @param {React.Component} Component
   * @param {object} [props]
   * @param {object} [routerStubs]
   * @returns {React.Element} wrapped component element
   */
  stubRouterContext(Component, props = {}, routerStubs) {
    // Create wrapper component
    class WrappedComponent extends React.Component {

      static get childContextTypes() {
        return {
          router: React.PropTypes.func,
          routeDepth: React.PropTypes.number
        };
      }

      getChildContext() {
        return {
          router: Object.assign(RouterStub, routerStubs),
          routeDepth: 0
        };
      }

      render() {
        return (<Component {...props} />);
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
    return function (strings, element) {
      let matchedElements = Array.from(element.querySelectorAll(selector));

      matchedElements.forEach(function (stringElement) {
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
      ), Component);
  }

};

module.exports = JestUtil;
