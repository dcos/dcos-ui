jest.dontMock('../CollapsingString');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../ServiceDetailTaskTab');
jest.dontMock('../TaskView');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var JestUtil = require('../../utils/JestUtil');

var Service = require('../../structs/Service');
var ServiceDetailTaskTab = require('../ServiceDetailTaskTab');
var TaskView = require('../TaskView');

describe('ServiceDetailTaskTab', function () {

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
      JestUtil.stubRouterContext(ServiceDetailTaskTab, {service}),
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    it('renders task view', function () {
      var taskView =  TestUtils
        .findRenderedComponentWithType(this.instance, TaskView);

      expect(taskView).toBeDefined();
    });

  });

});
