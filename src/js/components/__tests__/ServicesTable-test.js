jest.dontMock('../CollapsingString');
jest.dontMock('../../constants/HealthStatus');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../ServicesTable');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var ServicesTable = require('../ServicesTable');
var Service = require('../../structs/Service');

describe('ServicesTable', function () {

  const healthyService = new Service({
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
      <ServicesTable />,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#renderStats', function () {

    it('should render resources/stats cpus property', function () {
      var cpusCell = ReactDOM.render(
        this.instance.renderStats('cpus', healthyService),
        this.container
      );

      expect(ReactDOM.findDOMNode(cpusCell).textContent).toEqual('1');
    });

    it('should render resources/stats mem property', function () {
      var memCell = ReactDOM.render(
        this.instance.renderStats('mem', healthyService),
        this.container
      );

      expect(ReactDOM.findDOMNode(memCell).textContent).toEqual('2 GiB');

    });

    it('should render resources/stats disk property', function () {
      var disksCell = ReactDOM.render(
        this.instance.renderStats('disk', healthyService),
        this.container
      );

      expect(ReactDOM.findDOMNode(disksCell).textContent).toEqual('0 B');
    });

  });

});
