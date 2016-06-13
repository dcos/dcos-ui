const TestUtils = require('react-addons-test-utils');
import React from 'react';
import ReactDOM from 'react-dom';

let stores = {
  CosmosPackagesStore: '../stores/CosmosPackagesStore',
  MarathonStore: '../stores/MarathonStore',
  MesosLogStore: '../stores/MesosLogStore',
  MesosStateStore: '../stores/MesosStateStore',
  MesosSummaryStore: '../stores/MesosSummaryStore',
  MetadataStore: '../stores/MetadataStore',
  TaskDirectoryStore: '../stores/TaskDirectoryStore'
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
