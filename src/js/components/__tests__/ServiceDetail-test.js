jest.dontMock('../PageHeader');
jest.dontMock('../ServiceDetail');
jest.dontMock('../ServiceDetailTaskTab');
jest.dontMock('../ServiceInfo');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var JestUtil = require('../../utils/JestUtil');

var Service = require('../../structs/Service');
var ServiceDetail = require('../ServiceDetail');
var ServiceDetailTaskTab = require('../ServiceDetailTaskTab');

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
    tasksUnhealthy: 0
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

    it('renders placeholder', function () {
      var configurationTabView = ReactDOM.render(
        this.instance.renderConfigurationTabView('disk'),
        this.container
      );

      expect(configurationTabView.textContent).toEqual('Configuration Placeholder');
    });

  });

  describe('#renderDebugTabView', function () {

    it('renders placeholder', function () {
      var debugTabView = ReactDOM.render(
        this.instance.renderDebugTabView('disk'),
        this.container
      );

      expect(debugTabView.textContent).toEqual('Debug Placeholder');
    });

  });

  describe('#renderLogsTabView', function () {

    it('renders placeholder', function () {
      var logsTabView = ReactDOM.render(
        this.instance.renderLogsTabView('disk'),
        this.container
      );

      expect(logsTabView.textContent).toEqual('Logs Placeholder');
    });

  });

  describe('#renderTasksTabView', function () {

    it('renders task tab', function () {
      var tasksTabView = ReactDOM.render(
        this.instance.renderTasksTabView(),
        this.container
      );
      var serviceDetailTaskTab = TestUtils
        .findRenderedComponentWithType(tasksTabView, ServiceDetailTaskTab);

      expect(serviceDetailTaskTab).toBeDefined();

    });

  });

});
