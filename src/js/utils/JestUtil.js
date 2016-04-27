const TestUtils = require('react-addons-test-utils');
import React from 'react';

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
  static getCurrentParams() {}
  static getCurrentQuery() {}
  static getLocation() {}
  static isActive() {}
  static getRouteAtDepth() {}
  static setRouteComponentAtDepth() {}
  static setRouteComponentAtDepth() {}
}

const JestUtil = {
  renderAndFindTag: function (instance, tag) {
    var result = TestUtils.renderIntoDocument(instance);
    return TestUtils.findRenderedDOMComponentWithTag(result, tag);
  },

  unMockStores: function (storeIDs) {
    Object.keys(stores).forEach(function (storeID) {
      if (storeIDs.indexOf(storeID) === -1) {
        jest.setMock(stores[storeID], {});
      }
    });
  },

  dontMockStore: function (storeID) {
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
   * @returns {React.Element} wrapped component element
   */
  stubRouterContext: function (Component, props={}) {
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
          router: RouterStub,
          routeDepth: 0
        };
      }

      render() {
        return (<Component {...props} />);
      }

    }

    return React.createElement(WrappedComponent);
  }

};

module.exports = JestUtil;
