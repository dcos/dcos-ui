jest.dontMock('../PageHeader');
jest.dontMock('../ServiceDetail');
jest.dontMock('../ServiceDetailTaskTab');
jest.dontMock('../ServiceDetailConfigurationTab');
jest.dontMock('../ServiceInfo');
jest.dontMock('../../structs/Service');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var JestUtil = require('../../utils/JestUtil');

var Service = require('../../structs/Service');
var ServiceDetail = require('../ServiceDetail');
var ServiceDetailConfigurationTab = require('../ServiceDetailConfigurationTab');
var ServiceDetailTaskTab = require('../ServiceDetailTaskTab');
var ServiceDetailVolumeTab = require('../ServiceDetailVolumesTab');

describe('ServiceDetail', function () {

  const service = new Service({
    id: '/group/test',
    healthChecks: [{path: '', protocol: 'HTTP'}],
    cpus: 1,
    mem: 2048,
    disk: 0,
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
      expect(this.node.querySelector('h1').textContent).toEqual('test');
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

    it('renders placeholder', function () {
      var debugTabView = ReactDOM.render(
        this.instance.renderDebugTabView(),
        this.container
      );

      expect(debugTabView.textContent).toEqual('Debug Placeholder');
    });

  });

  describe('#renderVolumeTabView', function () {

    it('renders volume tab', function () {
      var volumeTabView = ReactDOM.render(
        this.instance.renderVolumesTabView(),
        this.container
      );
      var serviceDetailVolumeTab = TestUtils.findRenderedComponentWithType(
        volumeTabView,
        ServiceDetailVolumeTab
      );

      expect(serviceDetailVolumeTab).toBeDefined();

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
