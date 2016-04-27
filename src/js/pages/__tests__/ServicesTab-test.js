jest.dontMock('../services/ServicesTab');
jest.dontMock('../../mixins/InternalStorageMixin');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var JestUtil = require('../../utils/JestUtil');

var AlertPanel = require('../../components/AlertPanel');
var DCOSStore = require('../../stores/DCOSStore');
var ServicesTab = require('../services/ServicesTab');
var ServiceTree = require('../../structs/ServiceTree');
var ServiceDetail = require('../../components/ServiceDetail');
var ServicesTable = require('../../components/ServicesTable');

describe('ServicesTab', function () {

  beforeEach(function () {
    DCOSStore.serviceTree = new ServiceTree({
      id: '/',
      apps: [{
        id: '/alpha'
      }]
    });
    DCOSStore.dataProcessed = true;
    this.container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    it('renders the service table', function () {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}}),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, ServicesTable)
      ).toBeDefined();
    });

    it('renders the service detail', function () {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/alpha'}}),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, ServiceDetail)
      ).toBeDefined();
    });

    it('renders loading screen', function () {
      DCOSStore.dataProcessed = false;
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}}),
        this.container
      );

      var node = ReactDOM.findDOMNode(instance);
      expect(
        node.querySelector('.ball-scale')
      ).toBeDefined();
    });

    it('renders correct empty panel', function () {
      DCOSStore.serviceTree = new ServiceTree({id: '/'});
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}}),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, AlertPanel)
      ).toBeDefined();
    });

  });

});
