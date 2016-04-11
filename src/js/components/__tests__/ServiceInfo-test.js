jest.dontMock('../ServiceInfo');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

var Service = require('../../structs/Service');
var ServiceInfo = require('../ServiceInfo');

describe('ServiceInfo', function () {

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


  describe('#render', function () {
    beforeEach(function () {
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <ServiceInfo service={service} />,
        this.container
      );
      this.node = ReactDOM.findDOMNode(this.instance);
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('renders name', function () {
      expect(this.node.querySelector('h1').textContent).toEqual('test');
    });

    it('renders image', function () {
      expect(
        this.node.querySelector('.icon img').src
      ).toEqual('./img/services/icon-service-default-large@2x.png');
    });

    it('renders health state', function () {
      expect(
        this.node.querySelectorAll('.media-object-item')[2].textContent
      ).toEqual('Healthy');
    });

    it('renders number of running tasks', function () {
      expect(
        this.node.querySelectorAll('.media-object-item')[3].textContent
      ).toEqual('2 Running Tasks');
    });

  });
});
