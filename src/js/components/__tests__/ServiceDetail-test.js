jest.dontMock('../ServiceDetail');
jest.dontMock('../ServiceInfo');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

var Service = require('../../structs/Service');
var ServiceDetail = require('../ServiceDetail');

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
    this.instance = ReactDOM.render(
      <ServiceDetail service={service} />,
      this.container
    );
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

    it('renders placeholder', function () {
      var tasksTabView = ReactDOM.render(
        this.instance.renderTasksTabView('disk'),
        this.container
      );

      expect(tasksTabView.textContent).toEqual('Tasks Placeholder');
    });

  });

});
