jest.dontMock('../CollapsingString');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../ServiceDetailTaskTab');
jest.dontMock('../TaskView');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const JestUtil = require('../../utils/JestUtil');

const Service = require('../../structs/Service');
const ServiceDetailTaskTab = require('../ServiceDetailTaskTab');
const TaskView = require('../TaskView');

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
      var taskView = TestUtils
        .findRenderedComponentWithType(this.instance, TaskView);

      expect(taskView).toBeDefined();
    });

  });

});
