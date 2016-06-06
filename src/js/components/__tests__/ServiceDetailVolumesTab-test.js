jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../ServiceDetailTaskTab');
jest.dontMock('../TaskView');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var JestUtil = require('../../utils/JestUtil');

var Service = require('../../structs/Service');
var ServiceDetailVolumesTab = require('../ServiceDetailVolumesTab');

describe('ServiceDetailVolumesTab', function () {

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
    volumes: [{
      containerPath: 'path',
      host: '0.0.0.1',
      id: 'volume-id',
      mode: 'RW',
      size: 2048,
      status: 'Attached',
      type: 'Persistent'
    }]
  });

  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      JestUtil.stubRouterContext(ServiceDetailVolumesTab, {service}),
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    // TODO: Add proper tests

  });

});
