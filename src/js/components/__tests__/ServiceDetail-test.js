jest.dontMock('../CollapsingString');
jest.dontMock('../DetailViewHeader');
jest.dontMock('../ServiceDetail');
jest.dontMock('../ServiceDetailDebugTab');
jest.dontMock('../ServiceDetailConfigurationTab');
jest.dontMock('../ServiceDetailTaskTab');
jest.dontMock('../ServiceInfo');
jest.dontMock('../../structs/Application');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const JestUtil = require('../../utils/JestUtil');

const Application = require('../../structs/Application');
const ServiceDetail = require('../ServiceDetail');
const ServiceDetailDebugTab = require('../ServiceDetailDebugTab');
const ServiceDetailConfigurationTab = require('../ServiceDetailConfigurationTab');
const ServiceDetailTaskTab = require('../ServiceDetailTaskTab');

describe('ServiceDetail', function () {

  const service = new Application({
    id: '/group/test',
    healthChecks: [{path: '', protocol: 'HTTP'}],
    deployments: [],
    cpus: 1,
    mem: 2048,
    disk: 0,
    deployments: [],
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0,
    version: '2001-01-01T01:01:01.001Z',
    versionInfo: {
      lastConfigChangeAt: '2001-01-01T01:01:01.001Z',
      lastScalingAt: '2001-01-01T01:01:01.001Z'
    }
  });

  beforeEach(function () {
    this.container = document.createElement('div');
    this.wrapper = ReactDOM.render(
      JestUtil.stubRouterContext(ServiceDetail, {service}),
      this.container
    );
    this.instance =
      TestUtils.findRenderedComponentWithType(this.wrapper, ServiceDetail);
    this.node = ReactDOM.findDOMNode(this.instance);
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    it('renders service info name', function () {
      expect(this.node.querySelector('.h1 .collapsing-string-full-string').textContent).toEqual('test');
    });

  });

  describe('#renderConfigurationTabView', function () {

    it('renders the configuration tab', function () {
      var configurationTabView = ReactDOM.render(
        this.instance.renderConfigurationTabView(),
        this.container
      );
      var serviceDetailTaskTab = TestUtils.findRenderedComponentWithType(
        configurationTabView,
        ServiceDetailConfigurationTab
      );

      expect(serviceDetailTaskTab).toBeDefined();

    });

  });

  describe('#renderDebugTabView', function () {

    it('renders debug tab', function () {
      var debugTabView = ReactDOM.render(
        this.instance.renderDebugTabView(),
        this.container
      );
      var serviceDetailDebugTab = TestUtils.findRenderedComponentWithType(
        debugTabView,
        ServiceDetailDebugTab
      );

      expect(serviceDetailDebugTab).toBeDefined();
    });

  });

  describe('#renderTasksTabView', function () {

    it('renders task tab', function () {
      var tasksTabView = ReactDOM.render(
        this.instance.renderTasksTabView(),
        this.container
      );
      var serviceDetailTaskTab = TestUtils.findRenderedComponentWithType(
        tasksTabView,
        ServiceDetailTaskTab
      );

      expect(serviceDetailTaskTab).toBeDefined();

    });

  });

});
